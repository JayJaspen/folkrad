"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BannerAd from "@/components/BannerAd";
import ResultFilter, { FilterState } from "@/components/filters/ResultFilter";
import VoteChart from "@/components/charts/VoteChart";
import { formatDate } from "@/lib/utils";

interface Question { id: string; title: string; published_at: string; week_number: number; year: number; }
interface VoteResult { option_id: string; option_text: string; vote_count: number; }

const EMPTY_FILTER: FilterState = { ageGroup: "", gender: "", lan: "" };

export default function ArkivPage() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQ, setSelectedQ] = useState<Question | null>(null);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [results, setResults] = useState<VoteResult[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("weekly_questions")
      .select("id, title, published_at, week_number, year")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setQuestions(data ?? []);
        if (data && data.length > 0) setSelectedQ(data[0]);
      });
  }, []);

  const fetchResults = useCallback(async () => {
    if (!selectedQ) return;
    const { data } = await supabase.rpc("get_question_results", {
      p_question_id: selectedQ.id,
      p_age_group: filter.ageGroup || null,
      p_gender: filter.gender || null,
      p_lan: filter.lan || null,
    });
    setResults(data ?? []);
  }, [selectedQ, filter]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  async function exportPDF() {
    if (!selectedQ || !chartRef.current) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const date = new Date().toLocaleDateString("sv-SE");
    pdf.setFontSize(16); pdf.setTextColor(0, 48, 135);
    pdf.text("Folkrådet – Arkiv", 14, 18);
    pdf.setFontSize(11); pdf.setTextColor(40, 40, 40);
    pdf.text(selectedQ.title, 14, 26);
    pdf.setFontSize(9); pdf.setTextColor(100, 100, 100);
    pdf.text(`Vecka ${selectedQ.week_number}, ${selectedQ.year} · Exporterat: ${date}`, 14, 32);
    const pdfW = pdf.internal.pageSize.getWidth() - 28;
    const imgProps = pdf.getImageProperties(imgData);
    pdf.addImage(imgData, "PNG", 14, 40, pdfW, (imgProps.height * pdfW) / imgProps.width);
    pdf.save(`folkradet-arkiv-v${selectedQ.week_number}-${selectedQ.year}.pdf`);
  }

  return (
    <div className="grid grid-cols-[160px_1fr_160px] gap-4 items-start">
      <div className="sticky top-4"><BannerAd position="left" /></div>

      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-xl font-bold text-primary">Arkiv</h1>
            {selectedQ && (
              <button onClick={exportPDF} className="btn-secondary text-sm">📄 Exportera PDF</button>
            )}
          </div>

          {/* Frågeväljare */}
          <div className="mb-4">
            <label className="label">Välj fråga</label>
            <select
              className="input"
              value={selectedQ?.id ?? ""}
              onChange={e => {
                const q = questions.find(q => q.id === e.target.value);
                if (q) { setSelectedQ(q); setFilter(EMPTY_FILTER); }
              }}
            >
              {questions.map(q => (
                <option key={q.id} value={q.id}>
                  Vecka {q.week_number}, {q.year} – {q.title}
                </option>
              ))}
            </select>
          </div>

          {selectedQ && (
            <>
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Publicerad {formatDate(selectedQ.published_at)}</p>
                <h2 className="font-bold text-gray-800">{selectedQ.title}</h2>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Filtrera:</p>
                <ResultFilter value={filter} onChange={setFilter} />
              </div>

              <div ref={chartRef} className="bg-white rounded-xl p-4">
                <VoteChart
                  data={results.map(r => ({ name: r.option_text, value: Number(r.vote_count) }))}
                  showToggle
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sticky top-4"><BannerAd position="right" /></div>
    </div>
  );
}
