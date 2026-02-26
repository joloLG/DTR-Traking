'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')

    const { error } = await login(email, password)
    
    if (error) {
      setError((error as any)?.message || 'Login failed')
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
          <CardTitle className="text-2xl sm:text-3xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your DTR tracker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 animate-slideUp">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{(error as any)?.message || error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
