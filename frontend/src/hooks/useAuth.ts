import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyToken,
    updateUser,
    clearError,
    setLoading
  } = useAuthStore()

  useEffect(() => {
    // Verify token on mount if we have one
    verifyToken()
  }, [verifyToken])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    setLoading
  }
}