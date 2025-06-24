import { useState, useEffect } from 'react'
import { AdminUser, AdminUserDetails, AdminStats } from '@/types/admin'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const { isAuthenticated, verifyToken } = useAuthStore()

  const fetchUsers = async (page: number = 1, limit: number = 10, search: string = '') => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await apiClient.get(`/admin/users?${params}`)
      
      if (response.success) {
        setUsers(response.users || [])
        setPagination(response.pagination || { page, limit, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      
      // Handle auth errors
      if (error instanceof Error && error.message.includes('увійдіть в систему')) {
        const refreshed = await verifyToken()
        if (refreshed) {
          // Retry after token refresh
          try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: limit.toString(),
              ...(search && { search })
            })
            const response = await apiClient.get(`/admin/users?${params}`)
            if (response.success) {
              setUsers(response.users || [])
              setPagination(response.pagination || { page, limit, total: 0, totalPages: 0 })
            }
          } catch (retryError) {
            toast.error('Не вдалося завантажити користувачів')
          }
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити користувачів')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string): Promise<AdminUserDetails | null> => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`)
      if (response.success && response.user) {
        setSelectedUser(response.user)
        return response.user
      }
      return null
    } catch (error) {
      console.error('Failed to fetch user details:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити деталі користувача')
      return null
    }
  }

  const fetchStats = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.get('/admin/users/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      // Don't show error for stats as it's not critical
    }
  }

  const fetchCurrentUserProfile = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.get('/users/profile')
      if (response.success && response.profile) {
        setCurrentUserProfile(response.profile)
      }
    } catch (error) {
      console.error('Failed to fetch current user profile:', error)
    }
  }

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    setIsUpdating(true)
    try {
      const response = await apiClient.put(`/admin/users/role/${userId}`, { role })
      if (response.success) {
        toast.success('Роль користувача оновлено успішно')
        
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
      return { success: false, error: response.error || 'Не вдалося оновити роль' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося оновити роль'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteUser = async (userId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/users/${userId}`)
      if (response.success) {
        toast.success('Користувача видалено успішно')
        
        // Remove from users list
        setUsers(prev => prev.filter(user => user.id !== userId))
        
        // Clear selected user if it was deleted
        if (selectedUser?.id === userId) {
          setSelectedUser(null)
        }
        
        return { success: true }
      }
      return { success: false, error: response.error || 'Не вдалося видалити користувача' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося видалити користувача'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const canModifyUser = (userId: string): boolean => {
    if (!currentUserProfile) return false
    
    // Can't modify yourself
    if (userId === currentUserProfile.id) return false
    
    // Only admins can modify users
    return currentUserProfile.role === 'admin'
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
      fetchStats()
      fetchCurrentUserProfile()
    } else {
      // Clear data when not authenticated
      setUsers([])
      setStats(null)
      setCurrentUserProfile(null)
      setSelectedUser(null)
    }
  }, [isAuthenticated])

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
    setSelectedUser,
    canModifyUser,
  }
}