"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Banner { id: string; name: string; position: "left" | "right"; adsense_slot?: string; image_url?: string; link_url?: string; is_active: boolean; }

const emptyBanner = () => ({ name: "", position: "left" as "left" | "right", adsense_slot: "", image_url: "", link_url: "", is_active: true });

export default function AdminCPMBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyBanner());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function load() {
    const { data } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    setBanners(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(b: Banner) {
    setEditing(b);
    setForm({ name: b.name, position: b.position, adsense_slot: b.adsense_slot ?? "", image_url: b.image_url ?? "", link_url: b.link_url ?? "", is_active: b.is_active });
    setCreating(false);
  }

  async function handleSave() {
    setLoading(true);
    const payload = { name: form.name, position: form.position, adsense_slot: form.adsense_slot || null, image_url: form.image_url || null, link_url: form.link_url || null, is_active: form.is_active };
    if (editing) {
      await supabase.from("banners").update(payload).eq("id", editing.id);
      setSuccess("Bannern har uppdaterats.");
    } else {
      await supabase.from("banners").insert(payload);
      setSuccess("Bannern har lagts till.");
    }
    setCreating(false); setEditing(null); setForm(emptyBanner());
    load(); setLoading(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function deleteBanner(id: string) {
    if (!confirm("Ta bort denna banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    load();
  }

  async function toggleActive(b: Banner) {
    await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id);
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x));
  }

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">CPM Banners</h1>
        <button onClick={() => { setCreating(true); setEditing(null); setForm(emptyBanner()); }} className="btn-primary text-sm">+ Ny banner</button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

      {/* Form */}
      {isFormOpen && (
        <div className="card border-2 border-primary/20">
          <h2 className="font-bold text-lg mb-4">{editing ? "Redigera banner" : "Ny banner"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Namn (internt)</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="t.ex. Vänster banner #1" />
            </div>
            <div>
              <label className="label">Position</label>
              <select className="input" value={form.position} onChange={e => setForm({...form, position: e.target.value as "left"|"right"})}>
                <option value="left">Vänster</option>
                <option value="right">Höger</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Google AdSense Slot-ID <span className="text-gray-400">(lämna tomt om du använder bild)</span></label>
              <input className="input" value={form.adsense_slot} onChange={e => setForm({...form, adsense_slot: e.target.value})} placeholder="t.ex. 1234567890" />
            </div>
            <div>
              <label className="label">Bild-URL <span className="text-gray-400">(alternativt till AdSense)</span></label>
              <input className="input" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Länk-URL</label>
              <input className="input" value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="accent-primary" />
              <label htmlFor="active" className="text-sm text-gray-700">Aktiv</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={loading || !form.name} className="btn-primary">{loading ? "Sparar..." : "Spara"}</button>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary">Avbryt</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card">
        {banners.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Inga banners tillagda ännu.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map(b => (
              <div key={b.id} className="flex items-center justify-between py-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {b.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                    <span className="text-xs border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                      {b.position === "left" ? "Vänster" : "Höger"}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1">{b.name}</p>
                  <p className="text-xs text-gray-400">
                    {b.adsense_slot ? `AdSense: ${b.adsense_slot}` : b.image_url ? "Bildbanner" : "Ingen källa konfigurerad"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(b)} className={`text-xs px-2 py-1.5 rounded-lg border ${b.is_active ? "border-gray-200 text-gray-500 hover:bg-gray-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                    {b.is_active ? "Inaktivera" : "Aktivera"}
                  </button>
                  <button onClick={() => startEdit(b)} className="text-xs px-2 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5">Redigera</button>
                  <button onClick={() => deleteBanner(b.id)} className="text-xs px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Ta bort</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 text-sm">💡 Om Google AdSense</h3>
        <p className="text-xs text-blue-700">
          Ange ditt AdSense Client-ID i miljövariabeln <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_ADSENSE_CLIENT</code>.
          Slot-ID:t ovan är det specifika annons-ID:t för denna bannerplats, vilket du hittar i ditt AdSense-konto.
        </p>
      </div>
    </div>
  );
}
