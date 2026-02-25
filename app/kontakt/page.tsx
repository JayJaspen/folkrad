'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Send, Mail } from 'lucide-react'

export default function KontaktPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      message: form.message,
    })

    setSent(true)
    setSending(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="section-title">Kontakta Oss</h1>
      <p className="section-subtitle">
        Har du frågor eller vill veta mer? Tveka inte att höra av dig.
      </p>

      <div className="mt-8">
        {sent ? (
          <div className="card text-center py-12">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="font-display text-2xl font-bold text-navy mb-2">
              Tack för ditt meddelande!
            </h2>
            <p className="text-gray-500">Vi återkommer så snart som möjligt.</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center gap-2 text-gray-500 mb-6">
              <Mail size={18} />
              <span className="text-sm">info@folkradet.se</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Namn</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">E-post</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Meddelande</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="input-field min-h-[150px] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? 'Skickar...' : 'Skicka'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
