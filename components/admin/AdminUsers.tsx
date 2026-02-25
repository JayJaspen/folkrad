'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@/types'
import { Search } from 'lucide-react'

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers((data as User[]) || [])
    setLoading(false)
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-navy">
          Användare ({users.length})
        </h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 !py-2 w-64"
            placeholder="Sök användare..."
          />
        </div>
      </div>

      {loading ? (
        <div className="card animate-pulse h-48" />
      ) : (
        <div className="card overflow-hidden !p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Användare</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kön</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Län</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Parti</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Roll</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registrerad</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-navy text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.gender || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.county || '–'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.party_preference || '–'}</td>
                  <td className="px-4 py-3">
                    <span className={user.role === 'admin' ? 'badge-gold' : 'badge bg-gray-100 text-gray-600'}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('sv-SE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">Inga användare hittades</p>
          )}
        </div>
      )}
    </div>
  )
}
