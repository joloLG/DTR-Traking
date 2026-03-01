import { useState, useCallback } from 'react'

interface RateLimitState {
  attempts: number
  lastAttempt: number
  isBlocked: boolean
  waitTime: number
}

export function useRateLimit(maxAttempts: number = 3, windowMs: number = 60000) {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
    waitTime: 0
  })

  const checkRateLimit = useCallback(() => {
    const now = Date.now()
    const timeSinceLastAttempt = now - state.lastAttempt
    
    // Reset window if enough time has passed
    if (timeSinceLastAttempt > windowMs) {
      setState({
        attempts: 0,
        lastAttempt: 0,
        isBlocked: false,
        waitTime: 0
      })
      return { allowed: true, waitTime: 0 }
    }

    // Check if blocked
    if (state.attempts >= maxAttempts) {
      const remainingWait = windowMs - timeSinceLastAttempt
      setState(prev => ({ ...prev, waitTime: remainingWait }))
      return { allowed: false, waitTime: remainingWait }
    }

    return { allowed: true, waitTime: 0 }
  }, [state, maxAttempts, windowMs])

  const recordAttempt = useCallback(() => {
    setState(prev => ({
      attempts: prev.attempts + 1,
      lastAttempt: Date.now(),
      isBlocked: prev.attempts + 1 >= maxAttempts,
      waitTime: 0
    }))
  }, [maxAttempts])

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      lastAttempt: 0,
      isBlocked: false,
      waitTime: 0
    })
  }, [])

  return {
    ...state,
    checkRateLimit,
    recordAttempt,
    reset
  }
}
