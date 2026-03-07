'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, Save } from 'lucide-react'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  initialContent: string
  onSave: (date: string, content: string) => void
}

export function NoteModal({ isOpen, onClose, date, initialContent, onSave }: NoteModalProps) {
  const [content, setContent] = useState(initialContent)

  const handleSave = () => {
    onSave(date, content)
    onClose()
  }

  const handleClose = () => {
    setContent(initialContent) // Reset to initial content
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Notes for {new Date(date).toLocaleDateString()}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Daily Activities & Notes</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your activities, learnings, and accomplishments for this day..."
              className="min-h-[200px] resize-none"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
