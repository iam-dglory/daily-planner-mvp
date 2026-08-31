// Domain types mirroring the Supabase Postgres schema.
// Kept hand-written (rather than generated) since the schema is small and fixed for this MVP.

export type Priority = 'low' | 'medium' | 'high'
export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  timezone: string
  settings: ProfileSettings
  created_at: string
  updated_at: string
}

export interface ProfileSettings {
  week_start_day: number // 0 = Sunday, 1 = Monday
  default_view: string
  enabled_features: FeatureFlag[]
}

export type FeatureFlag = 'recurring' | 'reminders' | 'calendar' | 'categories'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  title: string
  notes: string | null
  priority: Priority
  due_date: string | null // YYYY-MM-DD
  due_time: string | null // HH:MM:SS
  is_completed: boolean
  completed_at: string | null
  recurrence_freq: RecurrenceFreq
  recurrence_interval: number
  recurrence_byweekday: number[] | null
  recurrence_end_date: string | null
  recurring_parent_id: string | null
  reminder_minutes_before: number | null
  reminder_sent_at: string | null
  position: number
  created_at: string
  updated_at: string
}

export const PRESET_COLORS = [
  '#6366f1', // indigo (default)
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
]

export const REMINDER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'None', value: null },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
]
