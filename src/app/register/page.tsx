'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          if (event === 'SIGNED_IN') {
            router.push('/dashboard')
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

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })
    
    if (error) {
      setError(error.message || 'Registration failed')
      setLoading(false)
    } else if (data.user) {
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
        // Navigation will be handled by onAuthStateChange
      }
    }
    
    setLoading(false)
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl backdrop-blur-sm bg-white/95 transition-all duration-500 ease-in-out transform hover:scale-105 animate-fadeIn">
        <CardHeader className="text-center space-y-4 animate-slideDown">
          <div className="flex justify-center mb-4 animate-pulse">
            <img src="/images/myLogo.png" alt="Logo" className="h-16 w-auto transition-transform duration-300 hover:scale-110" />
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
