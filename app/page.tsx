'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/layout/AuthProvider'
import { WeekQuestionCard } from '@/components/WeekQuestionCard'
import { PartyPreference } from '@/components/PartyPreference'
import { HeroSection } from '@/components/HeroSection'
import type { WeekQuestion } from '@/types'

export default function HomePage() {
  const [activeQuestion, setActiveQuestion] = useState<WeekQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchActiveQuestion = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setActiveQuestion(data as WeekQuestion | null)
      setLoading(false)
    }

    fetchActiveQuestion()
  }, [])

  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Veckans Fråga */}
        <section>
          <h2 className="section-title">📋 Veckans Fråga</h2>
          <p className="section-subtitle">
            Svara på veckans fråga och se hur andra tycker
          </p>
          <div className="mt-8">
            {loading ? (
              <div className="card animate-pulse h-48" />
            ) : activeQuestion ? (
              <WeekQuestionCard question={activeQuestion} />
            ) : (
              <div className="card text-center py-12">
                <p className="text-4xl mb-4">📭</p>
                <h3 className="font-display text-xl font-bold text-navy">
                  Ingen aktiv fråga
                </h3>
                <p className="text-gray-500 mt-2">
                  Kom tillbaka snart för nästa veckofråga!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Partisympati */}
        <section>
          <h2 className="section-title">🏛 Partisympati</h2>
          <p className="section-subtitle">
            Vilken partifärg har du? Se hur fördelningen ser ut bland alla användare.
          </p>
          <div className="mt-8">
            <PartyPreference />
          </div>
        </section>
      </div>
    </div>
  )
}
