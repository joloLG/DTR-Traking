'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, X } from 'lucide-react'

interface DateRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (startDate: string, endDate: string) => void
  isGenerating: boolean
}

export function DateRangeModal({ isOpen, onClose, onGenerate, isGenerating }: DateRangeModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleGenerate = () => {
    if (startDate && endDate) {
      onGenerate(startDate, endDate)
      onClose()
    }
  }

  const handleClose = () => {
    setStartDate('')
    setEndDate('')
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
              <span>Select Date Range</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min={startDate}
            />
          </div>

          {startDate && endDate && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Duration:</strong> {calculateDuration(startDate, endDate)}
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!startDate || !endDate || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Narrative'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  if (diffDays === 7) {
    return '1 week'
  } else if (diffDays < 7) {
    return `${diffDays} days`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    const days = diffDays % 7
    return `${weeks} week${weeks > 1 ? 's' : ''}${days > 0 ? ` ${days} day${days > 1 ? 's' : ''}` : ''}`
  } else {
    return `${diffDays} days`
  }
}
