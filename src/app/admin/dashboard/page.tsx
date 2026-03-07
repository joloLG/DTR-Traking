'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { DTRRecord, User } from '@/lib/database'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Calendar, CheckCircle, Globe, Users, UserPlus, BarChart3, Mail } from 'lucide-react'
import { AdvancedEmailComposer } from '@/components/advanced-email-composer'

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [dtrRecords, setDtrRecords] = useState<DTRRecord[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalHours: 0,
    todayRecords: 0
  })

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }, [])

  // Fetch all DTR records
  const fetchAllDTRRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dtr_records')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setDtrRecords(data || [])
    } catch (error) {
      console.error('Error fetching DTR records:', error)
    }
  }, [])

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.ojt_hours_completed > 0).length
    const totalHours = allUsers.reduce((sum, u) => sum + u.ojt_hours_completed, 0)
    const todayRecords = dtrRecords.filter(r => r.date === formatDateToLocal(new Date())).length

    setStats({
      totalUsers,
      activeUsers,
      totalHours,
      todayRecords
    })
  }, [allUsers, dtrRecords])

  useEffect(() => {
    if (!loading && user) {
      fetchAllUsers()
      fetchAllDTRRecords()
    }
  }, [loading, user, fetchAllUsers, fetchAllDTRRecords])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Watermark for Loading State */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-linear-to-br from-red-200/20 to-red-300/20 rounded-full blur-3xl scale-150"></div>
            <div className="relative transform -rotate-12 select-none whitespace-nowrap text-center">
              <h1 className="font-bold text-transparent bg-clip-text bg-linear-to-br from-red-300/30 to-red-400/20 tracking-wider leading-tight"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 'clamp(2rem, 8vw, 6rem)'
                  }}>
                JLG DEV
              </h1>
              <h1 className="font-bold text-transparent bg-clip-text bg-linear-to-br from-red-300/25 to-red-400/15 tracking-wider leading-tight -mt-2 sm:-mt-3 md:-mt-4"
                  style={{ 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 'clamp(1.5rem, 6vw, 5rem)'
                  }}>
                SOLUTIONS
              </h1>
              <h1 className="font-bold text-transparent bg-clip-text bg-linear-to-br from-red-300/20 to-red-400/10 tracking-wider leading-tight -mt-1 sm:-mt-2 md:-mt-3"
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
              <Image src="/images/myLogo.png" alt="Logo" width={64} height={64} className="animate-pulse" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading admin dashboard...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-[#800000] text-white shadow-sm border-b z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Welcome Message */}
            <div className="shrink-0">
              <p className="text-lg sm:text-xl font-semibold">
                Welcome, {user.full_name}
              </p>
              <p className="text-xs sm:text-sm text-red-200">
                Admin Dashboard
              </p>
            </div>
            
            {/* Right Side - Logout Button Only */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2 text-white hover:bg-red-900 text-xs sm:text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with padding for fixed header */}
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-900 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-900 text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-700">{stats.activeUsers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-900 text-sm font-medium">Total Hours</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalHours.toFixed(1)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-900 text-sm font-medium">Today&apos;s Records</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.todayRecords}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Create and manage system users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.open('/admin/users', '_blank')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Open User Creation Panel
                </Button>
                <div className="text-sm text-gray-600">
                  <p>• Create single or bulk users</p>
                  <p>• Assign admin privileges</p>
                  <p>• Set OJT hour requirements</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Statistics
                </CardTitle>
                <CardDescription>
                  Current system overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Users</p>
                    <p className="font-semibold text-lg">{stats.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Active Users</p>
                    <p className="font-semibold text-lg">{stats.activeUsers}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Hours</p>
                    <p className="font-semibold text-lg">{stats.totalHours.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Today's Records</p>
                    <p className="font-semibold text-lg">{stats.todayRecords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Email Composer Section */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Advanced Email Communications
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">New</span>
                </CardTitle>
                <CardDescription>
                  High-performance bulk email system with real-time progress tracking and SMTP Node Mailer integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedEmailComposer 
                  adminName={user.full_name}
                  onEmailSent={(result) => {
                    if (result.success) {
                      // Refresh user stats or show success notification
                      console.log('Advanced email sent successfully:', result.message)
                    } else {
                      console.error('Advanced email failed:', result.error)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* All Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All System Users</span>
                <span className="text-sm font-normal text-gray-500">Total: {allUsers.length} users</span>
              </CardTitle>
              <CardDescription>
                Complete list of all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Role</th>
                      <th className="text-left p-3 font-semibold">Hours Completed</th>
                      <th className="text-left p-3 font-semibold">Hours Required</th>
                      <th className="text-left p-3 font-semibold">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((userItem) => {
                      const progress = userItem.ojt_hours_required > 0 
                        ? (userItem.ojt_hours_completed / userItem.ojt_hours_required) * 100 
                        : 0;
                      return (
                        <tr key={userItem.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{userItem.full_name}</td>
                          <td className="p-3">{userItem.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              userItem.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="p-3">{userItem.ojt_hours_completed.toFixed(1)}</td>
                          <td className="p-3">{userItem.ojt_hours_required}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    progress >= 100 ? 'bg-green-500' : 
                                    progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {allUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found in the system.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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
    </div>
  )
}
