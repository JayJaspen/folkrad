"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Setting { key: string; value: string; }

const SETTING_LABELS: Record<string, string> = {
  site_name: "Webbplatsens namn",
  admin_email: "Admin-e-post",
  adsense_client: "Google AdSense Client-ID",
  adsense_slot_left: "AdSense Slot – Vänster",
  adsense_slot_right: "AdSense Slot – Höger",
};

export default function AdminInstallningarPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.from("site_settings").select("*").then(({ data }) => {
      setSettings(data ?? []);
      const v: Record<string, string> = {};
      (data ?? []).forEach((s: Setting) => { v[s.key] = s.value ?? ""; });
      setValues(v);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    for (const [key, value] of Object.entries(values)) {
      await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    }
    setSuccess("Inställningarna har sparats!");
    setLoading(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-primary">Inställningar</h1>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Webbplatsinställningar</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {settings.map(s => (
            <div key={s.key}>
              <label className="label">{SETTING_LABELS[s.key] ?? s.key}</label>
              <input
                className="input"
                value={values[s.key] ?? ""}
                onChange={e => setValues({ ...values, [s.key]: e.target.value })}
                placeholder={`Ange ${SETTING_LABELS[s.key] ?? s.key}...`}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Sparar..." : "Spara inställningar"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Admin-konto</h2>
        <p className="text-sm text-gray-500 mb-4">
          För att ge en användare admin-behörighet, kör följande SQL direkt i Supabase-dashboarden:
        </p>
        <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto">
{`UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'admin@folkradet.se';`}
        </pre>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2 text-sm">⚠️ Miljövariabler</h3>
        <p className="text-xs text-amber-700">
          Känsliga nycklar (Supabase, 46elks, AdSense) ska sättas som miljövariabler i Vercel, inte här.
          Se <code className="bg-amber-100 px-1 rounded">.env.local.example</code> för en komplett lista.
        </p>
      </div>
    </div>
  );
}
