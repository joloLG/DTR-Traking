'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Failed to check authentication')
        setLoading(false)
        return
      }

      if (session) {
        // Fetch user profile
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError) {
          console.error('User fetch error:', userError)
          setError('Failed to load user profile')
          setLoading(false)
          return
        }
        
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Authentication check error:', err)
      setError('Authentication error occurred')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Sign out locally only (clears local session immediately)
      const { error: localSignOutError } = await supabase.auth.signOut({ scope: 'local' })
      
      if (localSignOutError) {
        console.error('Local logout error:', localSignOutError)
      }
      
      // Clear user state immediately
      setUser(null)
      
      // Force redirect to login page
      router.push('/login')
      router.refresh()
      
      // Also try to sign out from all sessions (optional, in background)
      supabase.auth.signOut({ scope: 'global' }).catch((err) => {
        console.log('Global sign out completed (or failed):', err)
      })
      
    } catch (err) {
      console.error('Logout error:', err)
      setError('Logout error occurred')
      // Still try to redirect even if there was an error
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('User refresh error:', error)
        setError('Failed to refresh user data')
        return
      }
      
      setUser(data)
    } catch (err) {
      console.error('User refresh error:', err)
      setError('Failed to refresh user data')
    }
  }, [user])

  useEffect(() => {
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/login')
          return
        }

        if (session) {
          // Fetch user profile
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.error('Auth state change user fetch error:', error)
            setUser(null)
            router.push('/login')
            return
          }
          
          setUser(data)
          
          // Route based on user role
          if (data.role === 'admin') {
            // Only redirect to admin dashboard if not already there
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
              router.push('/admin/dashboard')
            }
          } else {
            // Only redirect to user dashboard if not already there or on narrative-reports
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard') && window.location.pathname !== '/' && !window.location.pathname.startsWith('/narrative-reports')) {
              router.push('/dashboard')
            }
          }
        } else {
          setUser(null)
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkSession, router])

  return {
    user,
    loading,
    error,
    logout,
    refreshUser,
    checkSession
  }
}
