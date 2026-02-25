'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Users, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react'

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    totalSuggestions: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const [users, questions, answers, suggestions] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('answers').select('id', { count: 'exact', head: true }),
      supabase.from('suggestions').select('id', { count: 'exact', head: true }),
    ])

    setStats({
      totalUsers: users.count || 0,
      totalQuestions: questions.count || 0,
      totalAnswers: answers.count || 0,
      totalSuggestions: suggestions.count || 0,
    })
    setLoading(false)
  }

  const cards = [
    { label: 'Användare', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Frågor', value: stats.totalQuestions, icon: MessageSquare, color: 'text-gold bg-gold/10' },
    { label: 'Svar', value: stats.totalAnswers, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Förslag', value: stats.totalSuggestions, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy mb-6">Statistik</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="card text-center">
            <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center mx-auto mb-3`}>
              <card.icon size={22} />
            </div>
            {loading ? (
              <div className="h-8 bg-gray-100 rounded animate-pulse w-16 mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-navy">{card.value}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
