import { supabase } from './supabase'
import { CalendarNote, DATABASE_TABLES } from './database'

export class CalendarNotesService {
  // Fetch all calendar notes for a user
  static async getUserCalendarNotes(userId: string): Promise<CalendarNote[]> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.CALENDAR_NOTES)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching calendar notes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching calendar notes:', error)
      return []
    }
  }

  // Get a single calendar note for a specific date
  static async getCalendarNote(userId: string, date: string): Promise<CalendarNote | null> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.CALENDAR_NOTES)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, which is expected for new notes
          return null
        }
        console.error('Error fetching calendar note:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching calendar note:', error)
      return null
    }
  }

  // Create or update a calendar note (upsert operation)
  static async saveCalendarNote(userId: string, date: string, content: string): Promise<CalendarNote | null> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.CALENDAR_NOTES)
        .upsert({
          user_id: userId,
          date,
          content,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving calendar note:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error saving calendar note:', error)
      return null
    }
  }

  // Delete a calendar note
  static async deleteCalendarNote(userId: string, date: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(DATABASE_TABLES.CALENDAR_NOTES)
        .delete()
        .eq('user_id', userId)
        .eq('date', date)

      if (error) {
        console.error('Error deleting calendar note:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting calendar note:', error)
      return false
    }
  }

  // Get notes within a date range
  static async getNotesInRange(userId: string, startDate: string, endDate: string): Promise<CalendarNote[]> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.CALENDAR_NOTES)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching notes in range:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching notes in range:', error)
      return []
    }
  }

  // Get notes for a specific period (day, week, month)
  static async getNotesForPeriod(
    userId: string, 
    baseDate: string, 
    period: 'day' | 'week' | 'month'
  ): Promise<CalendarNote[]> {
    const date = new Date(baseDate)
    let startDate: string
    let endDate: string

    switch (period) {
      case 'day':
        startDate = endDate = baseDate
        break
      case 'week':
        const startOfWeek = new Date(date)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
        startOfWeek.setDate(diff)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        startDate = startOfWeek.toISOString().split('T')[0]
        endDate = endOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        startDate = endDate = baseDate
    }

    return await this.getNotesInRange(userId, startDate, endDate)
  }
}
