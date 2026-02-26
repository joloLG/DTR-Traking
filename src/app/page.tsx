'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, TrendingUp, ArrowRight } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/users')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            DTR Tracker
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Track your On-the-Job Training hours with our comprehensive Daily Time Record system. 
            Monitor your progress and manage your OJT requirements efficiently.
          </p>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/login')} variant="outline">
              Login
            </Button>
            <Button onClick={() => router.push('/register')} variant="outline">
              Register
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Time Tracking
              </CardTitle>
              <CardDescription>
                Clock in and out with ease, automatically calculate your hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your daily work hours with our intuitive time recording system. 
                Start and stop timers with a single click.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Progress Monitoring
              </CardTitle>
              <CardDescription>
                Visualize your OJT progress and see how close you are to completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor your completed hours against your requirements with detailed 
                progress tracking and analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                User Management
              </CardTitle>
              <CardDescription>
                Secure user authentication and personalized dashboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each user gets their own secure account with personalized settings 
                and comprehensive time tracking history.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Start Tracking?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6">
            Join now and take control of your OJT time management
          </p>
          <Button onClick={() => router.push('/register')} size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
