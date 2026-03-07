'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { DTRRecord } from '@/lib/database'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit2, Save, Calendar, TrendingUp, CheckCircle, Globe } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout, refreshUser } = useAuth()
  const [dtrRecords, setDtrRecords] = useState<DTRRecord[]>([])
  const [selectedDate, setSelectedDate] = useState(formatDateToLocal(new Date()))
  const [morningTimeIn, setMorningTimeIn] = useState('08:00')
  const [morningTimeOut, setMorningTimeOut] = useState('12:00')
  const [afternoonTimeIn, setAfternoonTimeIn] = useState('13:00')
  const [afternoonTimeOut, setAfternoonTimeOut] = useState('17:00')
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetHours, setTargetHours] = useState(0)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Initialize target hours from user data
  const targetHoursValue = user ? user.ojt_hours_required || 0 : 0
  const [initializedTargetHours, setInitializedTargetHours] = useState(false)
  if (user && !initializedTargetHours) {
    setTargetHours(targetHoursValue)
    setInitializedTargetHours(true)
  }

  const fetchDTRRecords = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching DTR records:', error)
      } else {
        setDtrRecords(data || [])
      }
    } catch (error) {
      console.error('Error fetching DTR records:', error)
    }
  }, [user])

  const checkTodayStatus = useCallback(async () => {
    if (!user) return

    const today = formatDateToLocal(new Date())
    
    try {
      const { data, error } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      if (data && !data.time_out) {
        // Description is no longer used, so we don't need to set it
      }
    } catch (error) {
      // This is expected when no record exists for today
      console.log('No DTR record found for today')
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [loading, user, router])

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        await fetchDTRRecords()
        await checkTodayStatus()
      }
      fetchData()
    }
  }, [user, fetchDTRRecords, checkTodayStatus])

  const calculateProgress = () => {
    if (!user) return 0
    return Math.min((user.ojt_hours_completed / user.ojt_hours_required) * 100, 100)
  }

  const calculateEstimatedDays = () => {
    if (!user) return 0
    const remainingHours = Math.max(user.ojt_hours_required - user.ojt_hours_completed, 0)
    const dailyHours = 8 // Assuming 8 hours per workday
    return Math.ceil(remainingHours / dailyHours)
  }

  const getDailyHoursForChart = () => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = formatDateToLocal(date)
      
      const dayRecords = dtrRecords.filter(record => record.date === dateStr)
      const totalHours = dayRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0)
      
      last7Days.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        hours: totalHours
      })
    }
    
    return last7Days
  }

  const handleUpdateTargetHours = async () => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ ojt_hours_required: targetHours })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating target hours:', error)
        return
      }

      setIsEditingTarget(false)
      refreshUser()
    } catch (error) {
      console.error('Error updating target hours:', error)
    }
  }

  const handleAddMorningShift = async () => {
    if (!user || !selectedDate || !morningTimeIn || !morningTimeOut) return

    try {
      // Check if morning shift already exists for this date
      const { data: existingRecords } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .eq('shift_type', 'morning')

      if (existingRecords && existingRecords.length > 0) {
        setSuccessMessage('Morning shift already exists for this date!')
        setShowSuccessAnimation(true)
        setTimeout(() => {
          setShowSuccessAnimation(false)
          setSuccessMessage('')
        }, 3000)
        return
      }

      const { error } = await supabase
        .from('dtr_records')
        .insert({
          user_id: user.id,
          date: selectedDate,
          time_in: morningTimeIn,
          time_out: morningTimeOut,
          description: 'Morning shift',
          shift_type: 'morning'
        })

      if (error) {
        console.error('Error adding morning record:', error)
        return
      }

      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 3000)
      
      // Reset morning times
      setMorningTimeIn('08:00')
      setMorningTimeOut('12:00')
      
      // Refresh data
      fetchDTRRecords()
      refreshUser()
    } catch (error) {
      console.error('Error adding morning DTR record:', error)
    }
  }

  const handleAddAfternoonShift = async () => {
    if (!user || !selectedDate || !afternoonTimeIn || !afternoonTimeOut) return

    try {
      // Check if afternoon shift already exists for this date
      const { data: existingRecords } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .eq('shift_type', 'afternoon')

      if (existingRecords && existingRecords.length > 0) {
        setSuccessMessage('Afternoon shift already exists for this date!')
        setShowSuccessAnimation(true)
        setTimeout(() => {
          setShowSuccessAnimation(false)
          setSuccessMessage('')
        }, 3000)
        return
      }

      const { error } = await supabase
        .from('dtr_records')
        .insert({
          user_id: user.id,
          date: selectedDate,
          time_in: afternoonTimeIn,
          time_out: afternoonTimeOut,
          description: 'Afternoon shift',
          shift_type: 'afternoon'
        })

      if (error) {
        console.error('Error adding afternoon record:', error)
        return
      }

      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 3000)
      
      // Reset afternoon times
      setAfternoonTimeIn('13:00')
      setAfternoonTimeOut('17:00')
      
      // Refresh data
      fetchDTRRecords()
      refreshUser()
    } catch (error) {
      console.error('Error adding afternoon DTR record:', error)
    }
  }

  const handleAddBothShifts = async () => {
    if (!user || !selectedDate) return

    try {
      // Check if records already exist for this date
      const { data: existingRecords } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)

      const hasMorningRecord = existingRecords?.some(record => record.shift_type === 'morning')
      const hasAfternoonRecord = existingRecords?.some(record => record.shift_type === 'afternoon')

      if (hasMorningRecord && hasAfternoonRecord) {
        setSuccessMessage('Both shifts already exist for this date!')
        setShowSuccessAnimation(true)
        setTimeout(() => {
          setShowSuccessAnimation(false)
          setSuccessMessage('')
        }, 3000)
        return
      }

      // Add morning shift with user's inputted times if it doesn't exist
      if (!hasMorningRecord) {
        const { error: morningError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: morningTimeIn,
            time_out: morningTimeOut,
            description: 'Morning shift',
            shift_type: 'morning'
          })

        if (morningError) {
          console.error('Error adding morning record:', morningError)
          return
        }
      }

      // Add afternoon shift with user's inputted times if it doesn't exist
      if (!hasAfternoonRecord) {
        const { error: afternoonError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: afternoonTimeIn,
            time_out: afternoonTimeOut,
            description: 'Afternoon shift',
            shift_type: 'afternoon'
          })

        if (afternoonError) {
          console.error('Error adding afternoon record:', afternoonError)
          return
        }
      }

      // Show success animation
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 3000)
      
      // Reset form to default values
      setMorningTimeIn('08:00')
      setMorningTimeOut('12:00')
      setAfternoonTimeIn('13:00')
      setAfternoonTimeOut('17:00')
      
      // Refresh data
      fetchDTRRecords()
      refreshUser()
    } catch (error) {
      console.error('Error adding both shifts:', error)
    }
  }

  const handleAddDTRRecord = async () => {
    if (!user || !selectedDate) return

    try {
      // Check if records already exist for this date
      const { data: existingRecords } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)

      const hasMorningRecord = existingRecords?.some(record => record.shift_type === 'morning')
      const hasAfternoonRecord = existingRecords?.some(record => record.shift_type === 'afternoon')

      // Add morning record if both times are provided and no morning record exists
      if (morningTimeIn && morningTimeOut && !hasMorningRecord) {
        const { error: morningError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: morningTimeIn,
            time_out: morningTimeOut,
            description: 'Morning shift',
            shift_type: 'morning'
          })

        if (morningError) {
          console.error('Error adding morning record:', morningError)
          return
        }
      }

      // Add afternoon record if both times are provided and no afternoon record exists
      if (afternoonTimeIn && afternoonTimeOut && !hasAfternoonRecord) {
        const { error: afternoonError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: afternoonTimeIn,
            time_out: afternoonTimeOut,
            description: 'Afternoon shift',
            shift_type: 'afternoon'
          })

        if (afternoonError) {
          console.error('Error adding afternoon record:', afternoonError)
          return
        }
      }

      // Show success animation only if at least one record was added
      if ((morningTimeIn && morningTimeOut && !hasMorningRecord) || 
          (afternoonTimeIn && afternoonTimeOut && !hasAfternoonRecord)) {
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)
        
        // Reset form to default values
        setMorningTimeIn('08:00')
        setMorningTimeOut('12:00')
        setAfternoonTimeIn('13:00')
        setAfternoonTimeOut('17:00')
        
        // Refresh data
        fetchDTRRecords()
        refreshUser()
      } else {
        // Show warning if trying to add duplicate records
        setSuccessMessage('One or both shifts already exist for this date!')
        setShowSuccessAnimation(true)
        setTimeout(() => {
          setShowSuccessAnimation(false)
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error adding DTR record:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return lastDay.getDate()
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  interface CalendarDay {
  date: number
  dateString: string
  hasRecord: boolean
  recordCount: number
  hasSingleShift: boolean
}

const getRecordsForDate = (dateString: string) => {
    return dtrRecords.filter(record => record.date === dateString)
  }

  const generateCalendarDays = (selectedDate: string) => {
    const date = new Date(selectedDate)
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = getDaysInMonth(date)
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    
    const days: (CalendarDay | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      // Use local timezone to create date string (YYYY-MM-DD format)
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const recordsForDay = getRecordsForDate(dateString)
      const hasRecord = recordsForDay.length > 0
      const recordCount = recordsForDay.length
      const hasSingleShift = recordCount === 1
      
      days.push({
        date: i,
        dateString,
        hasRecord,
        recordCount,
        hasSingleShift
      })
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Watermark for Loading State */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-200/20 to-red-300/20 rounded-full blur-3xl scale-150"></div>
            <div className="relative transform -rotate-12 select-none whitespace-nowrap text-center">
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-300/30 to-red-400/20 tracking-wider leading-tight"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 'clamp(2rem, 8vw, 6rem)'
                  }}>
                JLG DEV
              </h1>
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-300/25 to-red-400/15 tracking-wider leading-tight -mt-2 sm:-mt-3 md:-mt-4"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 'clamp(1.5rem, 6vw, 5rem)'
                  }}>
                SOLUTIONS
              </h1>
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-300/20 to-red-400/10 tracking-wider leading-tight -mt-1 sm:-mt-2 md:-mt-3"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 'clamp(1rem, 5vw, 4rem)'
                  }}>
                WORKS
              </h1>
            </div>
          </div>
        </div>
        
        {/* Loading Content */}
        <div className="relative z-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-auto">
            <div className="flex justify-center mb-4">
              <Image src="/images/myLogo.png" alt="Logo" width={64} height={64} className="animate-pulse" style={{ width: 'auto', height: 'auto' }} />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Progress Metrics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(user?.ojt_hours_required - user?.ojt_hours_completed, 0).toFixed(2)} hours
              </div>
              <div className="text-xs text-muted-foreground">
                {calculateProgress().toFixed(1)}% completed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Hours</CardTitle>
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                {isEditingTarget ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={targetHours}
                      onChange={(e) => setTargetHours(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8"
                      min="0"
                      step="0.5"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateTargetHours}
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingTarget(true)} 
                    className="text-2xl font-bold cursor-pointer hover:text-blue-600 flex items-center gap-2"
                  >
                    {user?.ojt_hours_required.toFixed(2)}
                    <Edit2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Click to edit target hours
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateEstimatedDays()} days
              </div>
              <div className="text-xs text-muted-foreground">
                to complete OJT requirements
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Time Tracking Section */}
          <div className="space-y-6">
            {/* Morning Shift */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Morning Shift
                </CardTitle>
                <CardDescription>
                  Log your morning work hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={formatDateToLocal(new Date())}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time In</label>
                    <Input
                      type="time"
                      value={morningTimeIn}
                      onChange={(e) => setMorningTimeIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Out</label>
                    <Input
                      type="time"
                      value={morningTimeOut}
                      onChange={(e) => setMorningTimeOut(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddMorningShift} 
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
                  disabled={!selectedDate || !morningTimeIn || !morningTimeOut}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">Add Morning Shift</span>
                  <span className="xs:hidden">Add Morning</span>
                </Button>
              </CardContent>
            </Card>

            {/* Afternoon Shift */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Afternoon Shift
                </CardTitle>
                <CardDescription>
                  Log your afternoon work hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time In</label>
                    <Input
                      type="time"
                      value={afternoonTimeIn}
                      onChange={(e) => setAfternoonTimeIn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Out</label>
                    <Input
                      type="time"
                      value={afternoonTimeOut}
                      onChange={(e) => setAfternoonTimeOut(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddAfternoonShift} 
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
                  disabled={!selectedDate || !afternoonTimeIn || !afternoonTimeOut}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">Add Afternoon Shift</span>
                  <span className="xs:hidden">Add Afternoon</span>
                </Button>

                {/* Success Animation */}
                {showSuccessAnimation && (
                  <div className="fixed top-20 right-2 sm:top-4 sm:right-4 z-50 animate-slideIn">
                    <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse ${
                      successMessage.includes('already exists') 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-medium">
                        {successMessage || (
                          <span>
                            <span className="hidden sm:inline">DTR Record Added Successfully!</span>
                            <span className="sm:hidden">DTR Added!</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Both Shifts Button */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Calendar className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-green-700">
                  Add both shifts at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleAddBothShifts} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base py-2 sm:py-3"
                  disabled={!selectedDate || !morningTimeIn || !morningTimeOut || !afternoonTimeIn || !afternoonTimeOut}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">Add Both Shifts</span>
                  <span className="xs:hidden">Add Both</span>
                </Button>
                <p className="text-xs text-green-600 mt-2 text-center">
                  Uses your inputted times for both shifts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Bar Graph - Visible on mobile only */}
          <div className="lg:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Daily Time Tracking</CardTitle>
                <CardDescription>
                  Your last 7 days of work hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getDailyHoursForChart().map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{day.date}</span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-600 h-4 rounded-full" 
                            style={{ width: `${Math.min((day.hours / 8) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm w-8 text-right">{day.hours.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar View
              </CardTitle>
              <CardDescription>
                Click on a date to add DTR records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prevMonth = new Date(selectedDate)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setSelectedDate(formatDateToLocal(prevMonth))
                    }}
                  >
                    Previous
                  </Button>
                  <div className="text-lg font-semibold">
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextMonth = new Date(selectedDate)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setSelectedDate(formatDateToLocal(nextMonth))
                    }}
                  >
                    Next
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Weekday headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays(selectedDate).map((day, index) => {
                    const recordsForDay = day ? getRecordsForDate(day.dateString) : []
                    return (
                      <div
                        key={index}
                        className={`
                          aspect-square 
                          border 
                          p-2 
                          text-center 
                          text-sm
                          relative
                          ${day ? 'cursor-pointer hover:bg-gray-100' : ''}
                          ${day?.hasSingleShift ? 'bg-red-100 text-red-800 font-bold' : ''}
                          ${day?.hasRecord && !day?.hasSingleShift ? 'bg-green-100 text-green-800 font-bold' : ''}
                        `}
                        onClick={() => {
                          if (day) {
                            setSelectedDate(day.dateString)
                          }
                        }}
                        title={day && recordsForDay.length > 0 ? 
                          `${recordsForDay.length} shift(s):\n${recordsForDay.map(r => `${r.shift_type}: ${formatTime(r.time_in)} - ${r.time_out ? formatTime(r.time_out) : 'Active'}`).join('\n')}` 
                          : day ? 'Click to select this date' : ''
                        }
                      >
                        {day ? (
                          <div className={day.hasSingleShift ? 'text-red-600' : day.hasRecord ? 'text-green-600' : 'text-gray-900'}>
                            {day.date}
                            {day.hasRecord && (
                              <div className={`w-1 h-1 rounded-full mx-auto mt-1 ${
                                day.hasSingleShift ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 mt-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-100 border border-gray-300 rounded"></div>
                    <span>Single Shift</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-100 border border-gray-300 rounded"></div>
                    <span>Complete Day (2+ shifts)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    <span>Record Count</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent DTR Records */}
          <div className="lg:col-span-2 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent DTR Records</CardTitle>
                <CardDescription>
                  Your latest time records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dtrRecords.length === 0 ? (
                    <p className="text-gray-500 text-sm">No records yet</p>
                  ) : (
                    dtrRecords.map((record) => (
                      <div key={record.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{record.date}</p>
                            <p className="text-xs text-gray-500">{record.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {formatTime(record.time_in)} - {record.time_out ? formatTime(record.time_out) : 'Active'}
                            </p>
                            <p className="text-xs font-medium text-green-600">
                              +{(record.total_hours || 0).toFixed(2)} hours
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Fixed Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#800000] text-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Copyright */}
            <div className="text-sm">
              © JLG-Dev Solutions 2026
            </div>
            
            {/* Right Side - JLG DEV Site Link */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://jlgdev.vercel.app', '_blank')}
                className="flex items-center gap-2 text-white hover:bg-red-900 text-xs sm:text-sm"
              >
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">JLG DEV Solutions</span>
                <span className="sm:hidden">JLG DEV</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout? Any unsaved changes will be lost.</p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
