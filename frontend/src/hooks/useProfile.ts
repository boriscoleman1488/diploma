import { useState, useEffect } from 'react'
import { Profile, UpdateProfileData, ChangePasswordData, ProfileStats } from '@/types/profile'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { t } from '@/lib/translations'
import toast from 'react-hot-toast'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const fetchProfile = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await apiClient.get('/users/profile')
      if (response.success && response.profile) {
        setProfile(response.profile)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Backend error will be displayed as-is
      toast.error(error instanceof Error ? error.message : t('messages.failedToLoadProfile'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.get('/users/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.put('/users/profile', data)
      if (response.success && response.profile) {
        setProfile(response.profile)
        toast.success(t('messages.profileUpdated'))
        return { success: true }
      }
      return { success: false, error: response.error || t('messages.failedToUpdateProfile') }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('messages.failedToUpdateProfile')
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.put('/users/password', data)
      if (response.success) {
        toast.success(t('messages.passwordChanged'))
        return { success: true }
      }
      return { success: false, error: response.error || 'Password change failed' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.uploadFile('/users/avatar', file)
      if (response.success && response.avatarUrl) {
        setProfile(prev => prev ? { ...prev, avatar_url: response.avatarUrl } : null)
        toast.success(t('messages.avatarUploaded'))
        return { success: true, avatarUrl: response.avatarUrl }
      }
      return { success: false, error: response.error || 'Upload failed' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const searchUserByTag = async (tag: string) => {
    try {
      const response = await apiClient.get(`/users/search/${tag}`)
      if (response.success && response.profile) {
        return { success: true, profile: response.profile }
      }
      return { success: false, error: response.error || 'User not found' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      return { success: false, error: errorMessage }
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      fetchStats()
    }
  }, [isAuthenticated])

  return {
    profile,
    stats,
    isLoading,
    isUpdating,
    fetchProfile,
    fetchStats,
    updateProfile,
    changePassword,
    uploadAvatar,
    searchUserByTag,
  }
}