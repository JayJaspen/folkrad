export interface User {
  id: string
  email: string
  username: string
  phone?: string
  gender?: 'Kvinna' | 'Man' | 'Annan' | 'Vill ej ange'
  birth_year?: number
  county?: string
  party_preference?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface WeekQuestion {
  id: string
  title: string
  description?: string
  type: 'multiple_choice' | 'open'
  options?: string[]
  is_active: boolean
  created_at: string
  ends_at?: string
}

export interface QuestionAnswer {
  id: string
  question_id: string
  user_id: string
  answer: string
  created_at: string
}

export interface QuestionSuggestion {
  id: string
  user_id?: string
  title: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export interface Banner {
  id: string
  name: string
  image_url: string
  link_url: string
  size: '160x600' | '336x280' | '728x90'
  is_active: boolean
  impressions: number
  clicks: number
  created_at: string
}

export interface ArchiveQuestion extends WeekQuestion {
  total_answers: number
  answers_summary?: Record<string, number>
}

export const COUNTIES = [
  'Blekinge län',
  'Dalarnas län',
  'Gotlands län',
  'Gävleborgs län',
  'Hallands län',
  'Jämtlands län',
  'Jönköpings län',
  'Kalmar län',
  'Kronobergs län',
  'Norrbottens län',
  'Skåne län',
  'Stockholms län',
  'Södermanlands län',
  'Uppsala län',
  'Värmlands län',
  'Västerbottens län',
  'Västernorrlands län',
  'Västmanlands län',
  'Västra Götalands län',
  'Örebro län',
  'Östergötlands län',
] as const

export const PARTIES = [
  'Socialdemokraterna',
  'Moderaterna',
  'Sverigedemokraterna',
  'Centerpartiet',
  'Vänsterpartiet',
  'Kristdemokraterna',
  'Liberalerna',
  'Miljöpartiet',
  'Övriga',
] as const

export const GENDERS = ['Kvinna', 'Man', 'Annan', 'Vill ej ange'] as const

export const AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
] as const
