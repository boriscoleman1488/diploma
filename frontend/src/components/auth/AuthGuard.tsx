'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  const { isAuthenticated, isLoading, verifyToken, user, refreshToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!requireAuth) {
        setIsChecking(false)
        return
      }

      try {
        if (!isAuthenticated) {
          console.log('User not authenticated, verifying token...')
          const isValid = await verifyToken()
          
          if (!isValid) {
            console.log('Token verification failed, trying to refresh...')
            const refreshed = await refreshToken()
            
            if (!refreshed) {
              console.log('Token refresh failed, redirecting to login')
              router.push(redirectTo)
              return
            }
          }
        }
        
        console.log('Authentication check passed')
        setIsChecking(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
      }
    }

    if (!isLoading) {
      checkAuth()
    } else {
      const checkInterval = setInterval(() => {
        if (!isLoading) {
          clearInterval(checkInterval)
          checkAuth()
        }
      }, 100)
      
      return () => clearInterval(checkInterval)
    }
  }, [isAuthenticated, requireAuth, redirectTo, router, verifyToken, refreshToken, isLoading])

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