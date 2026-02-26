'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { DTRRecord } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, ExternalLink, Edit2, Save, LogOut, Menu, X } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [dtrRecords, setDtrRecords] = useState<DTRRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [morningTimeIn, setMorningTimeIn] = useState('')
  const [morningTimeOut, setMorningTimeOut] = useState('')
  const [afternoonTimeIn, setAfternoonTimeIn] = useState('')
  const [afternoonTimeOut, setAfternoonTimeOut] = useState('')
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetHours, setTargetHours] = useState(user?.ojt_hours_required || 0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchDTRRecords = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching DTR records:', error)
      } else {
        setDtrRecords(data || [])
      }
    } catch (error) {
      console.error('Error fetching DTR records:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const checkTodayStatus = useCallback(async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    try {
      const { data } = await supabase
        .from('dtr_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data && !data.time_out) {
        // Description is no longer used, so we don't need to set it
      }
    } catch (error) {
      console.error('Error checking today status:', error)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchDTRRecords()
    checkTodayStatus()
  }, [user, router, fetchDTRRecords, checkTodayStatus])

  const calculateProgress = () => {
    if (!user) return 0
    return Math.min((user.ojt_hours_completed / user.ojt_hours_required) * 100, 100)
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

  const handleAddDTRRecord = async () => {
    if (!user || !selectedDate) return

    try {
      // Add morning record if both times are provided
      if (morningTimeIn && morningTimeOut) {
        const { error: morningError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: morningTimeIn,
            time_out: morningTimeOut,
            description: 'Morning shift'
          })

        if (morningError) {
          console.error('Error adding morning record:', morningError)
          return
        }
      }

      // Add afternoon record if both times are provided
      if (afternoonTimeIn && afternoonTimeOut) {
        const { error: afternoonError } = await supabase
          .from('dtr_records')
          .insert({
            user_id: user.id,
            date: selectedDate,
            time_in: afternoonTimeIn,
            time_out: afternoonTimeOut,
            description: 'Afternoon shift'
          })

        if (afternoonError) {
          console.error('Error adding afternoon record:', afternoonError)
          return
        }
      }

      // Clear form
      setMorningTimeIn('')
      setMorningTimeOut('')
      setAfternoonTimeIn('')
      setAfternoonTimeOut('')
      
      // Refresh data
      fetchDTRRecords()
      refreshUser()
    } catch (error) {
      console.error('Error adding DTR record:', error)
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="shrink-0">
              <h1 className="text-xl font-bold text-gray-900">JLG Dev Solutions DTR TRACKER</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://jlgdev.vercel.app', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Visit My Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 border-t">
              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://jlgdev.vercel.app', '_blank')}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit My Site
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user.full_name}!</h2>
          <p className="text-gray-600">Track your OJT hours and manage your daily time records</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OJT Hours Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">
                  {user.ojt_hours_completed.toFixed(2)} / 
                  {isEditingTarget ? (
                    <Input
                      type="number"
                      value={targetHours}
                      onChange={(e) => setTargetHours(parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 ml-2 inline-block"
                      min="0"
                      step="0.5"
                    />
                  ) : (
                    <span onClick={() => setIsEditingTarget(true)} className="cursor-pointer hover:text-blue-600">
                      {user.ojt_hours_required.toFixed(2)}
                      <Edit2 className="w-3 h-3 ml-1 inline" />
                    </span>
                  )}
                </div>
                {isEditingTarget && (
                  <Button
                    size="sm"
                    onClick={handleUpdateTargetHours}
                    className="ml-2"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                )}
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
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Ready to track time
              </div>
              <div className="text-xs text-muted-foreground">
                Add your DTR records manually
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Remaining</CardTitle>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(user.ojt_hours_required - user.ojt_hours_completed, 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                hours to complete
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Clock in and out for your OJT hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Morning Shift</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Time In</label>
                      <Input
                        type="time"
                        value={morningTimeIn}
                        onChange={(e) => setMorningTimeIn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Time Out</label>
                      <Input
                        type="time"
                        value={morningTimeOut}
                        onChange={(e) => setMorningTimeOut(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Afternoon Shift</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Time In</label>
                      <Input
                        type="time"
                        value={afternoonTimeIn}
                        onChange={(e) => setAfternoonTimeIn(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-600">Time Out</label>
                      <Input
                        type="time"
                        value={afternoonTimeOut}
                        onChange={(e) => setAfternoonTimeOut(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddDTRRecord} 
                  className="flex-1"
                  disabled={!selectedDate || (!morningTimeIn && !afternoonTimeIn)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add DTR Record
                </Button>
              </div>
            </CardContent>
          </Card>

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
                            +{record.total_hours.toFixed(2)} hours
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
  )
}
