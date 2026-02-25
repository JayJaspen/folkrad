'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { WeekQuestion } from '@/types'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

export function AdminQuestions() {
  const [questions, setQuestions] = useState<WeekQuestion[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'multiple_choice' as 'multiple_choice' | 'open',
    options: ['', '', ''],
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false })
    setQuestions((data as WeekQuestion[]) || [])
  }

  const handleCreate = async () => {
    setSaving(true)
    const options = form.type === 'multiple_choice'
      ? form.options.filter(o => o.trim())
      : []

    // Deactivate all other questions first
    await supabase.from('questions').update({ is_active: false }).eq('is_active', true)

    await supabase.from('questions').insert({
      title: form.title,
      description: form.description || null,
      type: form.type,
      options,
      is_active: true,
    })

    setForm({ title: '', description: '', type: 'multiple_choice', options: ['', '', ''] })
    setShowForm(false)
    fetchQuestions()
    setSaving(false)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!isActive) {
      // Deactivate all first
      await supabase.from('questions').update({ is_active: false }).eq('is_active', true)
    }
    await supabase.from('questions').update({ is_active: !isActive }).eq('id', id)
    fetchQuestions()
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm('Vill du radera denna fråga?')) return
    await supabase.from('questions').delete().eq('id', id)
    fetchQuestions()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-navy">Veckofrågor</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm !py-2"
        >
          <Plus size={16} />
          Skapa Veckans Fråga
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-6 border-2 border-dashed border-gold/30">
          <h3 className="font-semibold text-navy mb-4">Ny veckofråga</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Fråga *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Vad tycker du om...?"
              />
            </div>

            <div>
              <label className="label">Beskrivning</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="label">Typ</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="input-field"
              >
                <option value="multiple_choice">Flerval</option>
                <option value="open">Öppen fråga</option>
              </select>
            </div>

            {form.type === 'multiple_choice' && (
              <div>
                <label className="label">Svarsalternativ</label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const opts = [...form.options]
                        opts[i] = e.target.value
                        setForm({ ...form, options: opts })
                      }}
                      className="input-field"
                      placeholder={`Alternativ ${i + 1}`}
                    />
                    {form.options.length > 2 && (
                      <button
                        onClick={() => {
                          const opts = form.options.filter((_, j) => j !== i)
                          setForm({ ...form, options: opts })
                        }}
                        className="text-red-400 hover:text-red-600 px-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setForm({ ...form, options: [...form.options, ''] })}
                  className="text-gold text-sm font-medium hover:underline"
                >
                  + Lägg till alternativ
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !form.title.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Skapar...' : 'Publicera fråga'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-outline"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Inga frågor skapade än</p>
        ) : (
          questions.map(q => (
            <div
              key={q.id}
              className={`card flex items-center justify-between ${
                q.is_active ? 'border-l-4 border-l-emerald-500' : ''
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-navy">{q.title}</h4>
                  {q.is_active && <span className="badge-success">Aktiv</span>}
                </div>
                <p className="text-sm text-gray-500">
                  {q.type === 'multiple_choice' ? 'Flerval' : 'Öppen'} ·{' '}
                  {new Date(q.created_at).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(q.id, q.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    q.is_active
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={q.is_active ? 'Inaktivera' : 'Aktivera'}
                >
                  {q.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Radera"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
