export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  created_at: string
  ojt_hours_required: number
  ojt_hours_completed: number
}

export interface DTRRecord {
  id: string
  user_id: string
  date: string
  time_in: string
  time_out: string | null
  total_hours: number
  description: string
  shift_type: 'morning' | 'afternoon' | 'regular'
  created_at: string
  updated_at: string
}

export interface CalendarNote {
  id: string
  user_id: string
  date: string
  content: string
  created_at: string
  updated_at: string
}

export interface SavedNarrative {
  id: string
  user_id: string
  title: string
  content: string
  period: 'day' | 'week' | 'month' | 'custom'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export const DATABASE_TABLES = {
  USERS: 'users',
  DTR_RECORDS: 'dtr_records',
  CALENDAR_NOTES: 'calendar_notes',
  GENERATED_NARRATIVES: 'generated_narratives'
} as const
