'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { WeekQuestion } from '@/types'
import { COUNTIES, GENDERS, AGE_RANGES } from '@/types'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'

export default function ArkivPage() {
  const [questions, setQuestions] = useState<WeekQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, Record<string, number>>>({})
  const [totals, setTotals] = useState<Record<string, number>>({})

  // Filters
  const [filterGender, setFilterGender] = useState('')
  const [filterCounty, setFilterCounty] = useState('')
  const [filterAge, setFilterAge] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', false)
      .order('created_at', { ascending: false })
    setQuestions((data as WeekQuestion[]) || [])
    setLoading(false)
  }

  const fetchResultsForQuestion = async (questionId: string) => {
    let query = supabase
      .from('answers')
      .select('answer, profiles!inner(gender, county, birth_year)')
      .eq('question_id', questionId)

    const { data } = await query

    if (data) {
      const counts: Record<string, number> = {}
      let total = 0
      data.forEach((a: any) => {
        // Apply filters
        if (filterGender && a.profiles?.gender !== filterGender) return
        if (filterCounty && a.profiles?.county !== filterCounty) return
        if (filterAge) {
          const year = a.profiles?.birth_year
          if (year) {
            const age = new Date().getFullYear() - year
            const [min, max] = filterAge === '65+' ? [65, 200] : filterAge.split('-').map(Number)
            if (age < min || age > max) return
          } else return
        }

        counts[a.answer] = (counts[a.answer] || 0) + 1
        total++
      })
      setResults(prev => ({ ...prev, [questionId]: counts }))
      setTotals(prev => ({ ...prev, [questionId]: total }))
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      fetchResultsForQuestion(id)
    }
  }

  // Re-fetch when filters change
  useEffect(() => {
    if (expandedId) fetchResultsForQuestion(expandedId)
  }, [filterGender, filterCounty, filterAge])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="section-title">📚 Arkiv</h1>
      <p className="section-subtitle">
        Tidigare veckofrågor — se resultat och filtrera efter kön, ålder och län
      </p>

      {/* Filters */}
      <div className="card mt-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gold" />
          <span className="font-semibold text-navy text-sm">Filtrera resultat</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="input-field !py-2 text-sm"
          >
            <option value="">Alla kön</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={filterAge}
            onChange={e => setFilterAge(e.target.value)}
            className="input-field !py-2 text-sm"
          >
            <option value="">Alla åldrar</option>
            {AGE_RANGES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={filterCounty}
            onChange={e => setFilterCounty(e.target.value)}
            className="input-field !py-2 text-sm"
          >
            <option value="">Alla län</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Questions */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Inga arkiverade frågor ännu</p>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="card">
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className="font-semibold text-navy">{q.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(q.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                {expandedId === q.id ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {expandedId === q.id && (
                <div className="mt-4 pt-4 border-t">
                  {results[q.id] && Object.keys(results[q.id]).length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        {totals[q.id] || 0} svar visas
                      </p>
                      {Object.entries(results[q.id])
                        .sort((a, b) => b[1] - a[1])
                        .map(([answer, count]) => {
                          const pct = totals[q.id] > 0 ? (count / totals[q.id]) * 100 : 0
                          return (
                            <div key={answer}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{answer}</span>
                                <span className="text-gray-500">
                                  {count} ({pct.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-3">
                                <div
                                  className="h-3 rounded-full bg-gold transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Inga svar med dessa filter</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
