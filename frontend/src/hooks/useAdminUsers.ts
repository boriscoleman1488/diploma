import { useState, useEffect } from 'react'
import { AdminUser, AdminUserDetails, AdminUsersResponse, AdminUserDetailsResponse, UpdateUserRoleData, AdminStats } from '@/types/admin'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { t } from '@/lib/translations'
import toast from 'react-hot-toast'

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  const { user } = useAuthStore()

  // Fetch current user profile to get admin info
  const fetchCurrentUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile')
      if (response.success && response.profile) {
        setCurrentUserProfile(response.profile)
      }
    } catch (error) {
      console.error('Failed to fetch current user profile:', error)
    }
  }

  const fetchUsers = async (page = 1, limit = 10, search = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response: AdminUsersResponse = await apiClient.get(`/admin/users?${params}`)
      
      if (response.success && response.users) {
        setUsers(response.users)
        setPagination(response.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error(error instanceof Error ? error.message : t('messages.failedToLoadUsers'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    setIsLoading(true)
    try {
      const response: AdminUserDetailsResponse = await apiClient.get(`/admin/users/${userId}`)
      
      if (response.success && response.user) {
        setSelectedUser(response.user)
        return response.user
      }
      return null
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error(error instanceof Error ? error.message : t('messages.failedToLoadUserDetails'))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    // Prevent admin from changing their own role
    if (currentUserProfile && userId === currentUserProfile.id) {
      toast.error('Ви не можете змінити власну роль')
      return { success: false, error: 'Ви не можете змінити власну роль' }
    }

    setIsUpdating(true)
    try {
      const response = await apiClient.put(`/admin/users/role/${userId}`, { role })
      
      if (response.success) {
        toast.success(t('messages.userRoleUpdated'))
        
        // Update users list
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role } : user
        ))
        
        // Update selected user if it's the same
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role } : null)
        }
        
        return { success: true }
      }
      return { success: false, error: response.error || t('messages.failedToUpdateUserRole') }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('messages.failedToUpdateUserRole')
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteUser = async (userId: string) => {
    // Prevent admin from deleting themselves
    if (currentUserProfile && userId === currentUserProfile.id) {
      toast.error('Ви не можете видалити власний акаунт')
      return { success: false, error: 'Ви не можете видалити власний акаунт' }
    }

    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      
      if (response.success) {
        toast.success(t('messages.userDeleted'))
        
        // Remove user from list
        setUsers(prev => prev.filter(user => user.id !== userId))
        
        // Clear selected user if it's the deleted one
        if (selectedUser?.id === userId) {
          setSelectedUser(null)
        }
        
        // Update pagination if needed
        const newTotal = pagination.total - 1
        const newTotalPages = Math.ceil(newTotal / pagination.limit)
        
        setPagination(prev => ({
          ...prev,
          total: newTotal,
          totalPages: newTotalPages
        }))
        
        return { success: true }
      }
      return { success: false, error: response.error || t('messages.failedToDeleteUser') }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('messages.failedToDeleteUser')
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/users/stats')
      
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  // Check if user can be modified (not current admin)
  const canModifyUser = (userId: string) => {
    return currentUserProfile ? userId !== currentUserProfile.id : true
  }

  useEffect(() => {
    fetchCurrentUserProfile()
    fetchUsers()
    fetchStats()
  }, [])

  return {
    users,
    selectedUser,
    stats,
    currentUserProfile,
    isLoading,
    isUpdating,
    pagination,
    fetchUsers,
    fetchUserDetails,
    updateUserRole,
    deleteUser,
    fetchStats,
    setSelectedUser,
    canModifyUser,
  }
}