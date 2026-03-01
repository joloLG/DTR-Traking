'use client'

import { useState, useEffect, useLayoutEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize success message from URL params
  const initialSuccessMessage = searchParams.get('message') === 'registration_success' 
    ? 'Registration successful! You can now log in with your credentials.'
    : ''
  const [successMessage] = useState(initialSuccessMessage)

  // Clear URL parameter after reading
  useLayoutEffect(() => {
    if (initialSuccessMessage) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('message')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [initialSuccessMessage])

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
          // Fetch user profile
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setUser(data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setError(error.message || 'Login failed')
      setLoading(false)
    }
    // Navigation will be handled by onAuthStateChange
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
      
      <Card className="w-full max-w-md rounded-2xl shadow-2xl backdrop-blur-sm bg-white/70 transition-all duration-500 ease-in-out transform hover:scale-105 animate-fadeIn relative z-10">
        <CardHeader className="text-center space-y-4 animate-slideDown">
          <div className="flex justify-center mb-4 animate-pulse">
            <Image src="/images/myLogo.png" alt="Logo" width={64} height={64} className="transition-transform duration-300 hover:scale-110" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your DTR tracker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800">Registration Successful!</h3>
                    <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register here
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
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
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
              <Image src="/images/myLogo.png" alt="Logo" width={64} height={64} className="animate-pulse" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Checking authentication...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
