'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: any }>
  register: (email: string, password: string, fullName: string, ojtHoursRequired: number) => Promise<{ error: any }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setLoading(false)
        return
      }

      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Add a small delay to prevent rapid successive requests
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases
        if (error.status === 429) {
          return { 
            error: { 
              message: 'Too many login attempts. Please wait a moment and try again.' 
            } 
          }
        }
        return { error }
      }

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const register = async (email: string, password: string, fullName: string, ojtHoursRequired: number) => {
    try {
      // Add a longer delay to prevent rapid successive requests
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases
        if (error.status === 429) {
          return { 
            error: { 
              message: 'Too many registration attempts. Please wait 30 seconds before trying again.' 
            } 
          }
        }
        return { error }
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            ojt_hours_required: ojtHoursRequired,
            ojt_hours_completed: 0,
          })

        if (profileError) {
          return { error: profileError }
        }

        await fetchUserProfile(data.user.id)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refreshUser = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
