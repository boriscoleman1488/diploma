'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const { verifyToken, isAuthenticated, session } = useAuthStore()

  useEffect(() => {
    if (session && !isAuthenticated) {
      verifyToken()
    }
  }, [session, isAuthenticated, verifyToken])

  return <>{children}</>
}