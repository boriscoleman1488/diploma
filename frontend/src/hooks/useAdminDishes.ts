import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Dish } from '@/types/dish'
import toast from 'react-hot-toast'

interface DishStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

export function useAdminDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [stats, setStats] = useState<DishStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchDishes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/dishes')
      if (response.success && response.dishes) {
        setDishes(response.dishes)
        setFilteredDishes(response.dishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/dishes/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  const handleViewDish = useCallback(async (dishId: string) => {
    try {
      const response = await apiClient.get(`/admin/dishes/${dishId}`)
      if (response.success && response.dish) {
        setSelectedDish(response.dish)
        setShowDetailsModal(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch dish details:', error)
      toast.error('Не вдалося завантажити деталі страви')
      return false
    }
  }, [])

  const handleModerateDish = useCallback(async (dishId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.patch(`/admin/dishes/moderate/${dishId}`, {
        status,
        rejection_reason: rejectionReason
      })

      if (response.success) {
        toast.success(`Страву ${status === 'approved' ? 'схвалено' : 'відхилено'}`)
        
        // Update dishes list
        setDishes(prev => prev.map(dish => 
          dish.id === dishId 
            ? { ...dish, status, moderated_at: new Date().toISOString(), rejection_reason: rejectionReason }
            : dish
        ))
        
        // Update selected dish
        if (selectedDish?.id === dishId) {
          setSelectedDish(prev => prev ? {
            ...prev,
            status,
            moderated_at: new Date().toISOString(),
            rejection_reason: rejectionReason
          } : null)
        }
        
        // Refresh stats
        fetchStats()
        return true
      } else {
        toast.error(response.error || 'Не вдалося модерувати страву')
        return false
      }
    } catch (error) {
      console.error('Failed to moderate dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося модерувати страву')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchStats, selectedDish])

  const handleDeleteDish = useCallback(async (dishId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/dishes/${dishId}`)
      
      if (response.success) {
        toast.success('Страву видалено успішно')
        
        // Remove from dishes list
        setDishes(prev => prev.filter(dish => dish.id !== dishId))
        
        // Close modal if this dish was selected
        if (selectedDish?.id === dishId) {
          setShowDetailsModal(false)
          setSelectedDish(null)
        }
        
        // Refresh stats
        fetchStats()
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити страву')
        return false
      }
    } catch (error) {
      console.error('Failed to delete dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити страву')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchStats, selectedDish])

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedDish(null)
  }, [])

  // Apply filters when search query or status filter changes
  useEffect(() => {
    let filtered = dishes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(dish => dish.status === statusFilter)
    }

    setFilteredDishes(filtered)
  }, [searchQuery, statusFilter, dishes])

  // Fetch dishes and stats on mount
  useEffect(() => {
    fetchDishes()
    fetchStats()
  }, [fetchDishes, fetchStats])

  return {
    dishes,
    filteredDishes,
    stats,
    isLoading,
    isUpdating,
    searchQuery,
    statusFilter,
    selectedDish,
    showDetailsModal,
    setSearchQuery,
    setStatusFilter,
    fetchDishes,
    fetchStats,
    handleViewDish,
    handleModerateDish,
    handleDeleteDish,
    closeDetailsModal,
    setSelectedDish,
    setShowDetailsModal
  }
}