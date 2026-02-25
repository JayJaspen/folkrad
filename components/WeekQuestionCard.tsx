'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/layout/AuthProvider'
import type { WeekQuestion } from '@/types'

interface Props {
  question: WeekQuestion
}

export function WeekQuestionCard({ question }: Props) {
  const { user, profile } = useAuth()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [openAnswer, setOpenAnswer] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [results, setResults] = useState<Record<string, number>>({})
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkExistingAnswer()
    }
    fetchResults()
  }, [user, question.id])

  const checkExistingAnswer = async () => {
    const { data } = await supabase
      .from('answers')
      .select('answer')
      .eq('question_id', question.id)
      .eq('user_id', user!.id)
      .single()

    if (data) {
      setSelectedAnswer(data.answer)
      setHasAnswered(true)
    }
  }

  const fetchResults = async () => {
    const { data } = await supabase
      .from('answers')
      .select('answer')
      .eq('question_id', question.id)

    if (data) {
      const counts: Record<string, number> = {}
      data.forEach(a => {
        counts[a.answer] = (counts[a.answer] || 0) + 1
      })
      setResults(counts)
      setTotalAnswers(data.length)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    const answer = question.type === 'open' ? openAnswer.trim() : selectedAnswer
    if (!answer) return

    setSubmitting(true)
    const { error } = await supabase
      .from('answers')
      .insert({
        question_id: question.id,
        user_id: user.id,
        answer,
      })

    if (!error) {
      setHasAnswered(true)
      setSelectedAnswer(answer)
      fetchResults()
    }
    setSubmitting(false)
  }

  const options = (question.options as string[]) || []

  return (
    <div className="card">
      <h3 className="font-display text-2xl font-bold text-navy mb-2">
        {question.title}
      </h3>
      {question.description && (
        <p className="text-gray-500 mb-6">{question.description}</p>
      )}

      {!user ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-3">Du måste vara inloggad för att svara</p>
          <a href="/login" className="btn-primary text-sm !py-2 !px-4">
            Logga in
          </a>
        </div>
      ) : hasAnswered ? (
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-emerald-700 font-medium">
              ✅ Du har svarat: <span className="font-bold">{selectedAnswer}</span>
            </p>
          </div>

          {/* Results */}
          {question.type === 'multiple_choice' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-navy text-sm uppercase tracking-wide">
                Resultat ({totalAnswers} svar)
              </h4>
              {options.map(option => {
                const count = results[option] || 0
                const pct = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0
                return (
                  <div key={option}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={option === selectedAnswer ? 'font-bold text-navy' : 'text-gray-600'}>
                        {option}
                      </span>
                      <span className="text-gray-500">
                        {count} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          option === selectedAnswer ? 'bg-gold' : 'bg-navy/30'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {question.type === 'multiple_choice' ? (
            <div className="space-y-3">
              {options.map(option => (
                <label
                  key={option}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAnswer === option
                      ? 'border-gold bg-gold/5'
                      : 'border-gray-200 hover:border-gold/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => setSelectedAnswer(option)}
                    className="sr-only"
                  />
                  <span className="font-medium text-navy">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={openAnswer}
              onChange={e => setOpenAnswer(e.target.value)}
              placeholder="Skriv ditt svar..."
              className="input-field min-h-[120px] resize-none"
              maxLength={2000}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || (!selectedAnswer && !openAnswer.trim())}
            className="btn-primary mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Skickar...' : 'Skicka svar'}
          </button>
        </div>
      )}
    </div>
  )
}
