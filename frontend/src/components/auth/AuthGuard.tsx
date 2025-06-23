'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { t } from '@/lib/translations'

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
  const { isAuthenticated, isLoading, verifyToken } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (requireAuth && !isAuthenticated) {
        const isValid = await verifyToken()
        if (!isValid) {
          router.push(redirectTo)
        }
      }
    }

    checkAuth()
  }, [isAuthenticated, requireAuth, redirectTo, router, verifyToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('messages.redirectingToLogin')}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}