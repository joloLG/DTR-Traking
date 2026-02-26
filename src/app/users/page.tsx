'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Clock, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export default function UsersPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState<Array<{
    description: string
    date: string
    hours: string
    time_range: string
  }>>([])

  const fetchRecentActivity = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/user/recent-activity')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data)
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const timer = setTimeout(() => {
      fetchRecentActivity()
    }, 0)

    return () => clearTimeout(timer)
  }, [user, router, fetchRecentActivity])

  if (!user) {
    return null
  }

  const calculateProgress = () => {
    if (!user) return 0
    return Math.min((user.ojt_hours_completed / user.ojt_hours_required) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">User Portal</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your OJT time tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {user.email}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.ojt_hours_completed.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                hours completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateProgress().toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                of {user.ojt_hours_required.toFixed(2)} hours
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(user.created_at)}
              </div>
              <div className="text-xs text-muted-foreground">
                account created
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your DTR tracking dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="w-full"
                size="lg"
              >
                <Clock className="w-4 h-4 mr-2" />
                Go to DTR Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  View Records
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Time Tracking
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OJT Requirements</CardTitle>
              <CardDescription>
                Track your On-the-Job Training progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Required Hours:</span>
                  <span className="text-sm font-bold">{user.ojt_hours_required.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed Hours:</span>
                  <span className="text-sm font-bold text-green-600">{user.ojt_hours_completed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Remaining Hours:</span>
                  <span className="text-sm font-bold text-orange-600">
                    {Math.max(user.ojt_hours_required - user.ojt_hours_completed, 0).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-bold mt-2">{calculateProgress().toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {recentActivity.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest time tracking activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.hours} hours</p>
                      <p className="text-xs text-gray-500">{activity.time_range}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
