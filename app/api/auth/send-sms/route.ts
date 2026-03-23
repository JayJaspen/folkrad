import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhone(phone: string): string {
  // Ensure Swedish format: convert 07X to +467X
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("0")) return "+46" + cleaned.slice(1);
  if (cleaned.startsWith("+")) return cleaned;
  return "+" + cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Mobilnummer krävs." }, { status: 400 });

    const formatted = formatPhone(phone);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store in Supabase
    const supabase = await createAdminClient();
    // Delete old codes for this number
    await supabase.from("sms_verifications").delete().eq("phone", formatted);
    await supabase.from("sms_verifications").insert({ phone: formatted, code, expires_at: expiresAt });

    // Send via 46elks
    const username = process.env.ELKS_API_USERNAME;
    const password = process.env.ELKS_API_PASSWORD;
    const from = process.env.ELKS_FROM_NAME ?? "Folkradet";

    if (!username || !password) {
      // Development mode: log the code
      console.log(`[DEV] SMS code for ${formatted}: ${code}`);
      return NextResponse.json({ success: true, dev_code: code });
    }

    const formData = new URLSearchParams({
      from,
      to: formatted,
      message: `Din verifieringskod till Folkrådet: ${code}. Koden gäller i 10 minuter.`,
    });

    const elksRes = await fetch("https://api.46elks.com/a1/sms", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!elksRes.ok) {
      const errText = await elksRes.text();
      console.error("46elks error:", errText);
      return NextResponse.json({ error: "Kunde inte skicka SMS. Försök igen." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internt serverfel." }, { status: 500 });
  }
}
