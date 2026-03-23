"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

interface Question { id: string; title: string; description?: string; published_at: string; week_number: number; year: number; is_active: boolean; }
interface Option { id?: string; option_text: string; sort_order: number; }

const emptyForm = () => ({
  title: "",
  description: "",
  week_number: new Date().getDate(), // simple placeholder
  year: new Date().getFullYear(),
  options: [{ option_text: "", sort_order: 0 }, { option_text: "", sort_order: 1 }] as Option[],
});

export default function AdminVeckansFragaPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getISOWeek() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  }

  useEffect(() => {
    setForm(f => ({ ...f, week_number: getISOWeek() }));
    loadQuestions();
  }, []);

  async function loadQuestions() {
    const { data } = await supabase.from("weekly_questions").select("*").order("published_at", { ascending: false });
    setQuestions(data ?? []);
  }

  function addOption() {
    if (form.options.length >= 20) return;
    setForm(f => ({ ...f, options: [...f.options, { option_text: "", sort_order: f.options.length }] }));
  }

  function removeOption(i: number) {
    if (form.options.length <= 2) return;
    setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  }

  function updateOption(i: number, text: string) {
    setForm(f => {
      const opts = [...f.options];
      opts[i] = { ...opts[i], option_text: text };
      return { ...f, options: opts };
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Ange en fråga."); return; }
    if (form.options.some(o => !o.option_text.trim())) { setError("Alla svarsalternativ måste fyllas i."); return; }
    setLoading(true); setError(""); setSuccess("");

    // Deactivate old active questions
    await supabase.from("weekly_questions").update({ is_active: false }).eq("is_active", true);

    const { data: q, error: qErr } = await supabase.from("weekly_questions").insert({
      title: form.title,
      description: form.description,
      week_number: form.week_number,
      year: form.year,
      is_active: true,
    }).select().single();

    if (qErr || !q) { setError(qErr?.message ?? "Fel vid skapande."); setLoading(false); return; }

    const opts = form.options.map((o, i) => ({ question_id: q.id, option_text: o.option_text, sort_order: i }));
    await supabase.from("question_options").insert(opts);

    setSuccess("Frågan har publicerats!");
    setForm(emptyForm());
    setCreating(false);
    loadQuestions();
    setLoading(false);
  }

  async function toggleActive(q: Question) {
    await supabase.from("weekly_questions").update({ is_active: !q.is_active }).eq("id", q.id);
    loadQuestions();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Veckans fråga</h1>
        <button onClick={() => setCreating(true)} className="btn-primary text-sm">+ Skapa ny fråga</button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

      {/* Create form */}
      {creating && (
        <div className="card border-2 border-primary/20">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Ny fråga</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Fråga *</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Skriv din fråga här..." />
            </div>
            <div>
              <label className="label">Beskrivning (valfritt)</label>
              <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ev. bakgrundsinformation..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Veckonummer</label>
                <input className="input" type="number" value={form.week_number} onChange={e => setForm({ ...form, week_number: parseInt(e.target.value) })} min={1} max={53} />
              </div>
              <div>
                <label className="label">År</label>
                <input className="input" type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Svarsalternativ ({form.options.length}/20)</label>
                {form.options.length < 20 && (
                  <button type="button" onClick={addOption} className="text-xs text-primary hover:underline">+ Lägg till alternativ</button>
                )}
              </div>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-400 text-sm pt-2.5 w-5">{i + 1}.</span>
                    <input className="input flex-1" value={opt.option_text} onChange={e => updateOption(i, e.target.value)} placeholder={`Alternativ ${i + 1}`} />
                    {form.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">{loading ? "Publicerar..." : "Publicera fråga"}</button>
              <button type="button" onClick={() => { setCreating(false); setError(""); }} className="btn-secondary">Avbryt</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Alla frågor</h2>
        {questions.length === 0 ? (
          <p className="text-gray-400 text-sm">Inga frågor skapade ännu.</p>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <div key={q.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {q.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                    <span className="text-xs text-gray-400">Vecka {q.week_number}, {q.year}</span>
                  </div>
                  <p className="font-medium text-gray-800">{q.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(q.published_at)}</p>
                </div>
                <button onClick={() => toggleActive(q)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${q.is_active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                  {q.is_active ? "Inaktivera" : "Aktivera"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
