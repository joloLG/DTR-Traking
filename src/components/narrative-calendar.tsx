'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit3, Save, X } from 'lucide-react'

interface CalendarNote {
  date: string
  content: string
}

interface NarrativeCalendarProps {
  notes: CalendarNote[]
  onNoteUpdate: (date: string, content: string) => void
  selectedDate: string
  onDateSelect: (date: string) => void
}

export function NarrativeCalendar({ notes, onNoteUpdate, selectedDate, onDateSelect }: NarrativeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [tempContent, setTempContent] = useState('')

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getNoteForDate = (date: string) => {
    return notes.find(note => note.date === date)?.content || ''
  }

  const hasNote = (date: string) => {
    return notes.some(note => note.date === date && note.content.trim() !== '')
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const startEditing = (date: string) => {
    setEditingDate(date)
    setTempContent(getNoteForDate(date))
  }

  const saveNote = () => {
    if (editingDate) {
      onNoteUpdate(editingDate, tempContent)
      setEditingDate(null)
      setTempContent('')
    }
  }

  const cancelEditing = () => {
    setEditingDate(null)
    setTempContent('')
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-gray-100"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = formatDate(date)
      const isSelected = dateStr === selectedDate
      const isToday = dateStr === formatDate(new Date())
      const hasNoteContent = hasNote(dateStr)
      const isEditing = editingDate === dateStr

      days.push(
        <div
          key={day}
          className={`
            h-20 border border-gray-200 p-1 cursor-pointer transition-all
            hover:bg-gray-50 relative
            ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
            ${isToday ? 'bg-yellow-50 border-yellow-300' : ''}
            ${hasNoteContent ? 'bg-green-50 border-green-200' : ''}
          `}
          onClick={() => onDateSelect(dateStr)}
        >
          <div className="flex justify-between items-start">
            <span className={`
              text-xs font-medium
              ${isSelected ? 'text-blue-700' : ''}
              ${isToday ? 'text-yellow-700' : ''}
              ${hasNoteContent ? 'text-green-700' : 'text-gray-700'}
            `}>
              {day}
            </span>
            {hasNoteContent && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {hasNoteContent && !isEditing && (
            <div className="mt-1 text-xs text-gray-600 line-clamp-2">
              {getNoteForDate(dateStr).substring(0, 40)}...
            </div>
          )}

          {isEditing && (
            <div className="mt-1" onClick={(e) => e.stopPropagation()}>
              <Textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                placeholder="Add your notes..."
                className="text-xs h-12 resize-none"
              />
              <div className="flex gap-1 mt-1">
                <Button size="sm" onClick={saveNote} className="h-6 text-xs">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditing} className="h-6 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute bottom-1 right-1 h-5 w-5 p-0 opacity-0 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                startEditing(dateStr)
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar Notes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Has notes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
