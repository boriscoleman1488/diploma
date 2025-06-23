import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useProfileStore } from '@/store/profileStore'

export function useAuth() {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    setUser,
    setSession,
    clearAuth,
  } = useAuthStore()

  const { fetchProfile } = useProfileStore()

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && session?.access_token) {
        // Check if token is expired
        const now = Date.now() / 1000
        if (session.expires_at && session.expires_at < now) {
          // Try to refresh token
          const refreshed = await refreshToken()
          if (!refreshed) {
            clearAuth()
            return
          }
        }

        // Fetch user profile
        try {
          await fetchProfile()
        } catch (error) {
          console.error('Failed to fetch profile on auth init:', error)
        }
      }
    }

    initializeAuth()
  }, [isAuthenticated, session, refreshToken, clearAuth, fetchProfile])

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    setUser,
    setSession,
    clearAuth,
  }
}