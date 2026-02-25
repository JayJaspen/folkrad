'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Fel e-post eller lösenord')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-gold" size={28} />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">
              Logga in
            </h1>
            <p className="text-gray-500 mt-2">
              Välkommen tillbaka till Folkrådet
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">E-post</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="din@epost.se"
                required
              />
            </div>

            <div>
              <label className="label">Lösenord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Har du inget konto?{' '}
            <Link href="/register" className="text-gold font-semibold hover:underline">
              Registrera dig
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
