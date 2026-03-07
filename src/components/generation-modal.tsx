'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Wand2, Loader2 } from 'lucide-react'

interface GenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (period: 'day' | 'week' | 'month', startDate: string, endDate: string) => Promise<void>
  isGenerating: boolean
  selectedDate: string
}

export function GenerationModal({ isOpen, onClose, onGenerate, isGenerating, selectedDate }: GenerationModalProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [startDate, setStartDate] = useState(selectedDate)
  const [endDate, setEndDate] = useState(selectedDate)
  const [selectedWeek, setSelectedWeek] = useState(0) // Week offset from current week
  const [selectedMonth, setSelectedMonth] = useState(0) // Month offset from current month

  // Calculate date range based on period and selection
  const dateRange = useMemo(() => {
    if (!isOpen) return { start: selectedDate, end: selectedDate }
    
    const getDateRangeForPeriod = (periodType: 'day' | 'week' | 'month') => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (periodType === 'day') {
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + selectedWeek) // Use selectedWeek as day offset for day period
        const dateStr = targetDate.toISOString().split('T')[0]
        return { start: dateStr, end: dateStr }
      }
      
      if (periodType === 'week') {
        // Get the selected week
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + (selectedWeek * 7))
        
        // Find the start of that week (Monday)
        const day = targetDate.getDay()
        const mondayOffset = day === 0 ? -6 : 1 - day // Sunday = 0, Monday = 1
        const startOfWeek = new Date(targetDate)
        startOfWeek.setDate(targetDate.getDate() + mondayOffset)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        }
      }
      
      if (periodType === 'month') {
        // Get the selected month
        const targetDate = new Date(today)
        targetDate.setMonth(today.getMonth() + selectedMonth)
        
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
        
        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0]
        }
      }
      
      return { start: selectedDate, end: selectedDate }
    }

    return getDateRangeForPeriod(period)
  }, [period, selectedWeek, selectedMonth, isOpen, selectedDate])

  // Update date range when it changes
  useEffect(() => {
    setStartDate(dateRange.start)
    setEndDate(dateRange.end)
  }, [dateRange])

  if (!isOpen) return null

  const handleGenerate = async () => {
    await onGenerate(period, startDate, endDate)
    if (!isGenerating) {
      onClose()
    }
  }

  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    setPeriod(newPeriod)
    setSelectedWeek(0) // Reset to current
    setSelectedMonth(0) // Reset to current
  }

  const getPeriodDescription = () => {
    switch (period) {
      case 'day':
        return 'Generate a narrative for a specific day'
      case 'week':
        return 'Generate a weekly narrative (Monday to Sunday)'
      case 'month':
        return 'Generate a monthly narrative covering all days'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold">Generate AI Narrative</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Select a time period to generate your OJT narrative report
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-0">
            {/* Period Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Period</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={period === 'day' ? 'default' : 'outline'}
                  onClick={() => handlePeriodChange('day')}
                  className="text-sm"
                  disabled={isGenerating}
                >
                  Day
                </Button>
                <Button
                  variant={period === 'week' ? 'default' : 'outline'}
                  onClick={() => handlePeriodChange('week')}
                  className="text-sm"
                  disabled={isGenerating}
                >
                  Week
                </Button>
                <Button
                  variant={period === 'month' ? 'default' : 'outline'}
                  onClick={() => handlePeriodChange('month')}
                  className="text-sm"
                  disabled={isGenerating}
                >
                  Month
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">{getPeriodDescription()}</p>
            </div>

            {/* Week/Month Selection */}
            {period === 'week' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Select Week</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((weekOffset) => {
                    const weekDate = new Date()
                    weekDate.setDate(weekDate.getDate() + (weekOffset * 7))
                    const weekStart = new Date(weekDate)
                    const day = weekStart.getDay()
                    const mondayOffset = day === 0 ? -6 : 1 - day
                    weekStart.setDate(weekDate.getDate() + mondayOffset)
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekStart.getDate() + 6)
                    
                    let label = `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`
                    if (weekOffset === 0) label = 'This Week'
                    else if (weekOffset === -1) label = 'Last Week'
                    else if (weekOffset === 1) label = 'Next Week'
                    
                    return (
                      <Button
                        key={weekOffset}
                        variant={selectedWeek === weekOffset ? 'default' : 'outline'}
                        onClick={() => setSelectedWeek(weekOffset)}
                        className="text-xs"
                        disabled={isGenerating}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {period === 'month' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Select Month</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((monthOffset) => {
                    const monthDate = new Date()
                    monthDate.setMonth(monthDate.getMonth() + monthOffset)
                    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    
                    let label = monthName
                    if (monthOffset === 0) label = 'This Month'
                    else if (monthOffset === -1) label = 'Last Month'
                    else if (monthOffset === 1) label = 'Next Month'
                    
                    return (
                      <Button
                        key={monthOffset}
                        variant={selectedMonth === monthOffset ? 'default' : 'outline'}
                        onClick={() => setSelectedMonth(monthOffset)}
                        className="text-xs"
                        disabled={isGenerating}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Date Range Display */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Date Range</label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(startDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(endDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Date Selection for Day */}
            {period === 'day' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Select Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setEndDate(e.target.value)
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isGenerating}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Narrative
                  </>
                )}
              </Button>
            </div>

            {/* Info Message */}
            <div className="text-center text-xs text-gray-500 pt-2 border-t">
              <p>AI will combine all your calendar notes from the selected period to create a comprehensive narrative report.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
