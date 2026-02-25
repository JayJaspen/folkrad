'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Shield, Users, MessageSquare, BarChart3, Archive, Settings, Image } from 'lucide-react'
import { AdminQuestions } from '@/components/admin/AdminQuestions'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminSuggestions } from '@/components/admin/AdminSuggestions'
import { AdminStats } from '@/components/admin/AdminStats'

type Tab = 'questions' | 'users' | 'suggestions' | 'stats'

export default function AdminPage() {
  const { profile, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('questions')

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/')
    }
  }, [loading, isAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    )
  }

  if (!isAdmin) return null

  const tabs = [
    { id: 'questions' as Tab, label: 'Veckans Fråga', icon: MessageSquare },
    { id: 'users' as Tab, label: 'Användare', icon: Users },
    { id: 'suggestions' as Tab, label: 'Förslag', icon: Archive },
    { id: 'stats' as Tab, label: 'Statistik', icon: BarChart3 },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Shield size={16} />
          Admin
        </div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Administrationspanel
        </h1>
        <p className="text-gray-500 mt-2">
          Hantera veckans fråga och se statistik
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-soft'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'questions' && <AdminQuestions />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'suggestions' && <AdminSuggestions />}
        {activeTab === 'stats' && <AdminStats />}
      </div>
    </div>
  )
}
