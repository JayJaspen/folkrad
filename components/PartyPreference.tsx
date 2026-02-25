'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/layout/AuthProvider'
import { PARTIES } from '@/types'

const PARTY_COLORS: Record<string, string> = {
  'Socialdemokraterna': '#E8112d',
  'Moderaterna': '#1B49DD',
  'Sverigedemokraterna': '#DDDD00',
  'Centerpartiet': '#009933',
  'Vänsterpartiet': '#DA291C',
  'Kristdemokraterna': '#000077',
  'Liberalerna': '#006AB3',
  'Miljöpartiet': '#83CF39',
  'Övriga': '#999999',
}

export function PartyPreference() {
  const { user, profile, refreshProfile } = useAuth()
  const [stats, setStats] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    if (profile?.party_preference) {
      setSelectedParty(profile.party_preference)
    }
  }, [profile])

  const fetchStats = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('party_preference')
      .not('party_preference', 'is', null)

    if (data) {
      const counts: Record<string, number> = {}
      let t = 0
      data.forEach(p => {
        if (p.party_preference) {
          counts[p.party_preference] = (counts[p.party_preference] || 0) + 1
          t++
        }
      })
      setStats(counts)
      setTotal(t)
    }
  }

  const handleSave = async (party: string) => {
    if (!user) return
    setSaving(true)
    setSelectedParty(party)

    await supabase
      .from('profiles')
      .update({ party_preference: party })
      .eq('id', user.id)

    await refreshProfile()
    await fetchStats()
    setSaving(false)
  }

  return (
    <div className="card">
      {!user ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-3">Logga in för att ange din partisympati</p>
          <a href="/login" className="btn-primary text-sm !py-2 !px-4">Logga in</a>
        </div>
      ) : !profile?.party_preference ? (
        <div>
          <h4 className="font-semibold text-navy mb-4">Vilket parti sympatiserar du med?</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PARTIES.map(party => (
              <button
                key={party}
                onClick={() => handleSave(party)}
                disabled={saving}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-gold 
                         text-sm font-medium text-navy transition-all hover:shadow-soft
                         disabled:opacity-50"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: PARTY_COLORS[party] }}
                />
                {party}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
            <p className="text-navy">
              Din partisympati:{' '}
              <span className="font-bold">
                <span
                  className="inline-block w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: PARTY_COLORS[profile.party_preference] }}
                />
                {profile.party_preference}
              </span>
            </p>
          </div>

          {/* Stats */}
          <h4 className="font-semibold text-navy text-sm uppercase tracking-wide mb-4">
            Fördelning ({total} röster)
          </h4>
          <div className="space-y-3">
            {PARTIES.map(party => {
              const count = stats[party] || 0
              const pct = total > 0 ? (count / total) * 100 : 0
              if (count === 0) return null
              return (
                <div key={party}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={party === profile.party_preference ? 'font-bold' : ''}>
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                        style={{ backgroundColor: PARTY_COLORS[party] }}
                      />
                      {party}
                    </span>
                    <span className="text-gray-500">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PARTY_COLORS[party],
                      }}
                    />
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}
    </div>
  )
}
