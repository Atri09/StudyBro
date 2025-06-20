import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Subject {
  id: string
  name: string
  description: string
  icon: string
  color: string
  created_at: string
}

export interface Topic {
  id: string
  subject_id: string
  title: string
  description: string
  order_index: number
  created_at: string
}

export interface Note {
  id: string
  topic_id: string
  title: string
  content: string
  short_notes: string
  mind_map_url?: string
  note_type: 'full' | 'short' | 'mindmap'
  created_at: string
}

export interface PracticeQuestion {
  id: string
  topic_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string
  target_date: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  subject_id: string
  topic_id?: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  notes?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  class_level: '11' | '12'
  stream: 'science' | 'commerce' | 'arts'
  created_at: string
}