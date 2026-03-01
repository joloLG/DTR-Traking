export interface User {
  id: string
  email: string
  full_name: string
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

export const DATABASE_TABLES = {
  USERS: 'users',
  DTR_RECORDS: 'dtr_records'
} as const
