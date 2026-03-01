'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { useRateLimit } from '@/hooks/use-rate-limit'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    ojtHoursRequired: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  
  const rateLimit = useRateLimit(3, 60000) // 3 attempts per minute
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // If user is already logged in, redirect to dashboard
        router.push('/dashboard')
      }
    }
    
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          if (event === 'SIGNED_IN') {
            // Check if this is a new registration (email confirmation)
            // by looking at the user's created_at time
            const userCreatedAt = new Date(session.user.created_at)
            const now = new Date()
            const timeDiff = now.getTime() - userCreatedAt.getTime()
            const minutesDiff = timeDiff / (1000 * 60)
            
            // If account was created within the last 5 minutes, it's likely a new registration
            if (minutesDiff < 5) {
              // New registration - redirect to login page to show success
              router.push('/login?message=registration_success')
            } else {
              // Existing user logging in - redirect to dashboard
              router.push('/dashboard')
            }
          }
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check rate limiting
    const { allowed, waitTime } = rateLimit.checkRateLimit()
    if (!allowed) {
      const waitSeconds = Math.ceil(waitTime / 1000)
      setError(`Please wait ${waitSeconds} seconds before trying again`)
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    const ojtHours = parseFloat(formData.ojtHoursRequired)
    if (isNaN(ojtHours) || ojtHours <= 0) {
      setError('Please enter a valid number for OJT hours required')
      return
    }

    setLoading(true)
    setError('')
    rateLimit.recordAttempt()

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })
    
    if (error) {
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        setError('Too many registration attempts. Please wait a few minutes before trying again.')
      } else {
        setError(error.message || 'Registration failed')
      }
      setLoading(false)
    } else if (data.user) {
      rateLimit.reset()
      // Add user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          ojt_hours_required: ojtHours,
          ojt_hours_completed: 0,
        })

      if (profileError) {
        // If profile insertion fails, clean up the auth user
        await supabase.auth.signOut()
        setError(profileError.message || 'Failed to create user profile')
        setLoading(false)
      } else {
        // Show confirmation modal instead of redirecting
        setShowConfirmationModal(true)
      }
    }
    
    setLoading(false)
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Watermark */}
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
      
      <Card className="w-full max-w-md rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 transition-all duration-500 ease-in-out transform hover:scale-105 animate-fadeIn relative z-10">
        <CardHeader className="text-center space-y-4 animate-slideDown">
          <div className="flex justify-center mb-4 animate-pulse">
            <Image src="/images/myLogo.png" alt="Logo" width={64} height={64} className="transition-transform duration-300 hover:scale-110" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Register</CardTitle>
          <CardDescription>
            Create your account to start tracking your DTR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ojtHoursRequired" className="text-sm font-medium text-gray-900">
                OJT Hours Required
              </label>
              <Input
                id="ojtHoursRequired"
                name="ojtHoursRequired"
                type="number"
                step="0.01"
                value={formData.ojtHoursRequired}
                onChange={handleChange}
                required
                placeholder="Enter required OJT hours"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-900">
                Show Password
              </label>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            {rateLimit.isBlocked && (
              <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                Rate limit active. Please wait {Math.ceil(rateLimit.waitTime / 1000)} seconds.
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || rateLimit.isBlocked}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Login here
            </Link>
          </div>
          
          {/* Copyright Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              © JLG-Dev Solutions 2026 | 
              <a 
                href="https://jlgdev.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                Visit our website
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title="Registration Successful!"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">Check your email</h3>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;ve sent a confirmation link to <strong>{formData.email}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-600 space-y-2">
            <p className="text-sm">
              To complete your registration, please:
            </p>
            <ol className="text-sm space-y-1 ml-4 list-decimal">
              <li>Open your Gmail app</li>
              <li>Find the confirmation email from us</li>
              <li>Click the confirmation link to verify your account</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> You won&apos;t be able to log in until you confirm your email address.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              onClick={() => setShowConfirmationModal(false)}
              className="flex-1"
            >
              I Understand
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://gmail.com', '_blank')}
              className="flex-1"
            >
              Open Gmail
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
