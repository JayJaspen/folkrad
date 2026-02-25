'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { UserPlus } from 'lucide-react'
import { COUNTIES, GENDERS } from '@/types'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    birthYear: '',
    county: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          phone: form.phone,
          gender: form.gender || null,
          birth_year: form.birthYear ? parseInt(form.birthYear) : null,
          county: form.county || null,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('E-postadressen är redan registrerad')
      } else {
        setError('Ett fel uppstod. Försök igen.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="font-display text-2xl font-bold text-navy mb-2">
            Konto skapat!
          </h2>
          <p className="text-gray-500 mb-6">
            Kolla din e-post för att bekräfta ditt konto.
          </p>
          <Link href="/login" className="btn-secondary">
            Gå till inloggning
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-gold" size={28} />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">
              Skapa konto
            </h1>
            <p className="text-gray-500 mt-2">
              Gå med i Folkrådet och gör din röst hörd
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Användarnamn *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => updateField('username', e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">E-post *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  className="input-field"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label className="label">Lösenord *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  className="input-field"
                  placeholder="Minst 6 tecken"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="label">Kön</label>
                <select
                  value={form.gender}
                  onChange={e => updateField('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="">Välj...</option>
                  {GENDERS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Födelseår</label>
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={e => updateField('birthYear', e.target.value)}
                  className="input-field"
                  min="1900"
                  max="2010"
                  placeholder="t.ex. 1990"
                />
              </div>

              <div>
                <label className="label">Län</label>
                <select
                  value={form.county}
                  onChange={e => updateField('county', e.target.value)}
                  className="input-field"
                >
                  <option value="">Välj län...</option>
                  {COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Skapar konto...' : 'Registrera dig'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Har du redan ett konto?{' '}
            <Link href="/login" className="text-gold font-semibold hover:underline">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
