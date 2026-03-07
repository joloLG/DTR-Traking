import { supabase } from './supabase'
import { DATABASE_TABLES, SavedNarrative } from './database'

export class NarrativeHistoryService {
  // Save a generated narrative to the database
  static async saveNarrative(
    userId: string,
    title: string,
    content: string,
    period: 'day' | 'week' | 'month' | 'custom',
    startDate: string,
    endDate: string
  ): Promise<SavedNarrative | null> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.GENERATED_NARRATIVES)
        .insert({
          user_id: userId,
          title,
          content,
          period,
          start_date: startDate,
          end_date: endDate
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving narrative:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error saving narrative:', error)
      return null
    }
  }

  // Get all saved narratives for a user
  static async getUserNarratives(userId: string): Promise<SavedNarrative[]> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.GENERATED_NARRATIVES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching narratives:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching narratives:', error)
      return []
    }
  }

  // Delete a narrative
  static async deleteNarrative(userId: string, narrativeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(DATABASE_TABLES.GENERATED_NARRATIVES)
        .delete()
        .eq('id', narrativeId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting narrative:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting narrative:', error)
      return false
    }
  }

  // Update a narrative
  static async updateNarrative(
    userId: string,
    narrativeId: string,
    updates: Partial<Pick<SavedNarrative, 'title' | 'content'>>
  ): Promise<SavedNarrative | null> {
    try {
      const { data, error } = await supabase
        .from(DATABASE_TABLES.GENERATED_NARRATIVES)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', narrativeId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating narrative:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating narrative:', error)
      return null
    }
  }
}
