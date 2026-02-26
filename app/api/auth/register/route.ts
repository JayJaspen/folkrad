import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendSMS, generateCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, gender, birth_year, county } = await request.json();

    if (!name || !email || !phone || !password || !gender || !birth_year || !county) {
      return NextResponse.json({ error: 'Alla fält måste fyllas i.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 6 tecken.' }, { status: 400 });
    }
    if (new Date().getFullYear() - birth_year < 18) {
      return NextResponse.json({ error: 'Du måste vara minst 18 år.' }, { status: 400 });
    }

    // Check duplicates
    const dup = await sql`SELECT id FROM users WHERE email=${email} OR phone=${phone}`;
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: 'E-post eller mobilnummer redan registrerat.' }, { status: 400 });
    }

    // Generate code + send SMS
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await sql`INSERT INTO sms_codes (phone, code, expires_at) VALUES (${phone}, ${code}, ${expiresAt})`;

    const sent = await sendSMS(phone, `Folkrådet: Din verifieringskod är ${code}`);
    if (!sent) {
      return NextResponse.json({ error: 'Kunde inte skicka SMS. Kontrollera numret.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Serverfel.' }, { status: 500 });
  }
}
