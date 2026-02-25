'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Check, X } from 'lucide-react'

interface Suggestion {
  id: string
  subject: string
  message: string
  type: string
  status: string
  created_at: string
}

export function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false })
    setSuggestions(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('suggestions').update({ status }).eq('id', id)
    fetchSuggestions()
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy mb-6">
        Förslag & Frågor ({suggestions.length})
      </h2>

      {loading ? (
        <div className="card animate-pulse h-48" />
      ) : suggestions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Inga förslag ännu</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={
                      s.status === 'pending' ? 'badge bg-yellow-50 text-yellow-700' :
                      s.status === 'approved' ? 'badge-success' : 'badge-danger'
                    }>
                      {s.status === 'pending' ? 'Väntar' : s.status === 'approved' ? 'Godkänd' : 'Avvisad'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {s.type === 'suggestion' ? 'Förslag på fråga' : 'Allmän fråga'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-navy">{s.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">{s.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(s.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                {s.status === 'pending' && (
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => updateStatus(s.id, 'approved')}
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      title="Godkänn"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, 'rejected')}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50"
                      title="Avvisa"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
