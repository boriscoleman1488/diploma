'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const { isAuthenticated, isLoading, verifyToken, session } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!requireAuth) {
        setIsChecking(false)
        return
      }

      try {
        // If we have a session, verify it
        if (session?.access_token) {
          console.log('Verifying token in AuthGuard...')
          const isValid = await verifyToken()
          if (!isValid) {
            console.log('Token verification failed, redirecting to login')
            router.push(redirectTo)
            return
          }
          console.log('Token verification successful')
        } else if (!isAuthenticated) {
          // No session and not authenticated, redirect to login
          console.log('No session found, redirecting to login')
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
        return
      } finally {
        setIsChecking(false)
      }
    }

    // Only run the check if we're not already loading
    if (!isLoading) {
      checkAuth()
    } else {
      // If we're already loading, wait for it to finish
      const checkInterval = setInterval(() => {
        if (!useAuthStore.getState().isLoading) {
          clearInterval(checkInterval)
          checkAuth()
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }
  }, [isAuthenticated, requireAuth, redirectTo, router, verifyToken, session, isLoading])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Перевірка автентифікації...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Перенаправлення на сторінку входу...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}