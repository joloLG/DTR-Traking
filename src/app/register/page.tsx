'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
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
  
  const { register } = useAuth()
  const router = useRouter()

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

    const { error } = await register(
      formData.email,
      formData.password,
      formData.fullName,
      ojtHours
    )
    
    if (error) {
      setError((error as any)?.message || 'Registration failed')
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-950">
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
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label htmlFor="ojtHoursRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{(error as any)?.message || error}</div>
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
