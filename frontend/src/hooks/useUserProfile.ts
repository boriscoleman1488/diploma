import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Profile, ProfileStats } from '@/types/profile'

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuthStore()

  const fetchUserProfile = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await apiClient.get('/users/profile')
      if (response.success && response.profile) {
        setProfile(response.profile)
      } else {
        toast.error('Не вдалося завантажити профіль')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити профіль')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.get('/users/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      // Don't show error toast for stats as it's not critical
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile()
      fetchUserStats()
    }
  }, [isAuthenticated])

  return {
    profile,
    stats,
    isLoading,
    fetchUserProfile,
    fetchUserStats
  }
}