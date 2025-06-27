'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

export function Providers({ children }: { children: React.ReactNode }) {
  const { session, isAuthenticated, verifyToken } = useAuthStore()

  useEffect(() => {
    // Set the session in API client when it changes
    if (session) {
      apiClient.setSession(session)
    }

    // Verify token on app start if we have a session but not authenticated
    if (session && !isAuthenticated) {
      verifyToken().catch((error) => {
        console.error('Initial token verification failed:', error)
      })
    }
  }, [session, isAuthenticated, verifyToken])

  // Set up periodic token refresh
  useEffect(() => {
    if (!isBrowser || !session?.access_token) return

    const checkTokenExpiry = () => {
      const now = Date.now() / 1000
      const expiresAt = session.expires_at
      const tenMinutes = 10 * 60

      // If token expires in less than 10 minutes, refresh it
      if (expiresAt && (expiresAt - now) < tenMinutes) {
        verifyToken().catch((error) => {
          console.error('Periodic token refresh failed:', error)
        })
      }
    }

    // Check every minute instead of every 5 minutes for more reliable token refresh
    const interval = setInterval(checkTokenExpiry, 60 * 1000)
    
    // Run an initial check immediately
    checkTokenExpiry()

    return () => clearInterval(interval)
  }, [session, verifyToken])

  return <>{children}</>
}