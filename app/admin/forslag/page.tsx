"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

interface Suggestion { id: string; username: string; suggestion: string; description?: string; submitted_at: string; is_read: boolean; }

export default function AdminForslagPage() {
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("question_suggestions").select("*").order("submitted_at", { ascending: false });
    setSuggestions(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    await supabase.from("question_suggestions").update({ is_read: true }).eq("id", id);
    setSuggestions(s => s.map(x => x.id === id ? { ...x, is_read: true } : x));
  }

  async function deleteSuggestion(id: string) {
    if (!confirm("Är du säker på att du vill ta bort detta förslag?")) return;
    await supabase.from("question_suggestions").delete().eq("id", id);
    setSuggestions(s => s.filter(x => x.id !== id));
  }

  const unread = suggestions.filter(s => !s.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-primary">Förslag från användare</h1>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} nya</span>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Laddar...</p>
      ) : suggestions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">Inga förslag inkomna ännu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => (
            <div key={s.id} className={`card border-2 ${!s.is_read ? "border-primary/30 bg-blue-50/30" : "border-transparent"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {!s.is_read && <span className="w-2 h-2 rounded-full bg-primary inline-block" />}
                    <span className="font-medium text-gray-700 text-sm">@{s.username}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(s.submitted_at)}</span>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">{s.suggestion}</p>
                  {s.description && <p className="text-sm text-gray-600">{s.description}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!s.is_read && (
                    <button onClick={() => markRead(s.id)} className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5">
                      Markera läst
                    </button>
                  )}
                  <button onClick={() => deleteSuggestion(s.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                    Radera
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
