'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, FileText, Wand2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { NarrativeCalendar } from '@/components/narrative-calendar'
import { NoteModal } from '@/components/note-modal'
import { DateRangeModal } from '@/components/date-range-modal'
import { GenerationModal } from '@/components/generation-modal'
import { CalendarNotesService } from '@/lib/calendar-notes-service'
import { NarrativeAIService } from '@/lib/ai-service'
import { NarrativeHistoryService } from '@/lib/narrative-history-service'
import { SavedNarrative } from '@/lib/database'

interface CalendarNote {
  date: string
  content: string
}

export default function NarrativeReportsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentReport, setCurrentReport] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([])
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedNoteDate, setSelectedNoteDate] = useState('')
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false)
  const [generationModalOpen, setGenerationModalOpen] = useState(false)
  const [generatedNarratives, setGeneratedNarratives] = useState<SavedNarrative[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [loading, user, router])

  const loadNarrativeHistory = useCallback(async () => {
    if (!user) return
    
    try {
      const narratives = await NarrativeHistoryService.getUserNarratives(user.id)
      setGeneratedNarratives(narratives)
    } catch (error) {
      console.error('Error loading narrative history:', error)
    }
  }, [user])

  const loadCalendarNotes = useCallback(async () => {
    if (!user) return
    
    try {
      const notes = await CalendarNotesService.getUserCalendarNotes(user.id)
      setCalendarNotes(notes.map(note => ({
        date: note.date,
        content: note.content
      })))
    } catch (error) {
      console.error('Error loading calendar notes:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadCalendarNotes()
      loadNarrativeHistory()
    }
  }, [user, loadCalendarNotes, loadNarrativeHistory])

  const handleGenerateWithModal = async (period: 'day' | 'week' | 'month', startDate: string, endDate: string) => {
    if (!user) return

    setIsGenerating(true)
    try {
      // Get notes from database based on selected period
      const dbNotes = await CalendarNotesService.getNotesInRange(user.id, startDate, endDate)
      const notes = dbNotes.map(note => ({
        date: note.date,
        content: note.content
      }))
      
      if (notes.length === 0) {
        setSuccessMessage(`No notes found for the selected period. Please add some notes to the calendar first.`)
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }
      
      // Generate narrative using AI
      const aiService = new NarrativeAIService()
      const summary = await aiService.generateNarrative({
        period,
        startDate,
        endDate,
        notes,
        userName: user.full_name
      })
      
      // Save the generated narrative to database
      const savedNarrative = await NarrativeHistoryService.saveNarrative(
        user.id,
        `${period.charAt(0).toUpperCase() + period.slice(1)} Narrative - ${new Date(startDate).toLocaleDateString()}`,
        summary,
        period,
        startDate,
        endDate
      )
      
      if (savedNarrative) {
        setGeneratedNarratives(prev => [savedNarrative, ...prev])
        setSuccessMessage(`${period.charAt(0).toUpperCase() + period.slice(1)} narrative saved successfully!`)
      } else {
        setSuccessMessage('Narrative generated but could not be saved')
      }
      
      setCurrentReport(summary)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error generating narrative:', error)
      setSuccessMessage('Error generating narrative. Please try again.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCalendarNoteUpdate = async (date: string, content: string) => {
    if (!user) return
    
    try {
      if (content.trim()) {
        // Save or update the note
        await CalendarNotesService.saveCalendarNote(user.id, date, content)
        setCalendarNotes(prev => {
          const existingIndex = prev.findIndex(note => note.date === date)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = { date, content }
            return updated
          } else {
            return [...prev, { date, content }]
          }
        })
        setSuccessMessage('Note saved successfully!')
      } else {
        // Delete the note if content is empty
        await CalendarNotesService.deleteCalendarNote(user.id, date)
        setCalendarNotes(prev => prev.filter(note => note.date !== date))
        setSuccessMessage('Note deleted successfully!')
      }
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error saving note:', error)
      setSuccessMessage('Error saving note')
      setTimeout(() => setSuccessMessage(''), 2000)
    }
  }

  const handleCalendarDateClick = (date: string) => {
    setSelectedNoteDate(date)
    setNoteModalOpen(true)
  }

  const handleGenerateWithRange = async (startDate: string, endDate: string) => {
    if (!user) return

    setIsGenerating(true)
    try {
      // Get notes from database within the selected date range
      const dbNotes = await CalendarNotesService.getNotesInRange(user.id, startDate, endDate)
      const notes = dbNotes.map(note => ({
        date: note.date,
        content: note.content
      }))
      
      if (notes.length === 0) {
        setSuccessMessage(`No notes found for the selected period. Please add some notes to the calendar first.`)
        setTimeout(() => setSuccessMessage(''), 3000)
        return
      }
      
      // Generate narrative using AI
      const aiService = new NarrativeAIService()
      const summary = await aiService.generateNarrative({
        period: 'custom',
        startDate,
        endDate,
        notes,
        userName: user.full_name
      })
      
      // Save the generated narrative to database
      const savedNarrative = await NarrativeHistoryService.saveNarrative(
        user.id,
        `Narrative Report (${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()})`,
        summary,
        'custom',
        startDate,
        endDate
      )
      
      if (savedNarrative) {
        setGeneratedNarratives(prev => [savedNarrative, ...prev])
        setSuccessMessage('Narrative generated and saved successfully!')
      } else {
        setSuccessMessage('Narrative generated but could not be saved')
      }
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error generating narrative:', error)
      setSuccessMessage('Error generating narrative. Please try again.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Narrative Reports</h1>
          <p className="text-gray-600">Document your daily OJT experiences and generate weekly summaries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Calendar and Generation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Generation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generate AI Narrative
                </CardTitle>
                <CardDescription>
                  Select date range and generate comprehensive OJT narrative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={() => setGenerationModalOpen(true)}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate AI Narrative
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to select period and generate comprehensive OJT narrative
                  </p>
                </div>
              </CardContent>
            </Card>

            <NarrativeCalendar
              notes={calendarNotes}
              onNoteUpdate={handleCalendarNoteUpdate}
              selectedDate={selectedDate}
              onDateSelect={handleCalendarDateClick}
            />
          </div>

          {/* Main Content - Narrative Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Narrative Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Narrative Editor
                </CardTitle>
                <CardDescription>
                  Edit and copy your AI-generated narrative report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentReport}
                  onChange={(e) => setCurrentReport(e.target.value)}
                  placeholder="Generated narrative will appear here..."
                  className="min-h-[400px]"
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {currentReport.length} characters
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(currentReport)
                      setSuccessMessage('Narrative copied to clipboard!')
                      setTimeout(() => setSuccessMessage(''), 2000)
                    }}
                    disabled={!currentReport.trim()}
                  >
                    Copy to Clipboard
                  </Button>
                </div>

                {successMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    successMessage.includes('Error') 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {successMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Narrative History Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Narrative History
              </CardTitle>
              <CardDescription>
                Your previously generated AI narrative reports - click any to load and edit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedNarratives.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No generated narratives yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click "Generate AI Narrative" to create your first report
                    </p>
                  </div>
                ) : (
                  generatedNarratives.map((narrative) => (
                    <div
                      key={narrative.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setCurrentReport(narrative.content)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{narrative.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {new Date(narrative.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          narrative.period === 'day' ? 'bg-blue-100 text-blue-700' :
                          narrative.period === 'week' ? 'bg-green-100 text-green-700' :
                          narrative.period === 'month' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {narrative.period?.charAt(0).toUpperCase() + narrative.period?.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(narrative.start_date).toLocaleDateString()} - {new Date(narrative.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {narrative.content.substring(0, 150)}...
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(narrative.content)
                            setSuccessMessage('Narrative copied to clipboard!')
                            setTimeout(() => setSuccessMessage(''), 2000)
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Add delete functionality
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        date={selectedNoteDate}
        initialContent={calendarNotes.find(note => note.date === selectedNoteDate)?.content || ''}
        onSave={handleCalendarNoteUpdate}
      />

      <GenerationModal
        isOpen={generationModalOpen}
        onClose={() => setGenerationModalOpen(false)}
        onGenerate={handleGenerateWithModal}
        isGenerating={isGenerating}
        selectedDate={selectedDate}
      />

      <DateRangeModal
        isOpen={dateRangeModalOpen}
        onClose={() => setDateRangeModalOpen(false)}
        onGenerate={handleGenerateWithRange}
        isGenerating={isGenerating}
      />
    </DashboardLayout>
  )
}
