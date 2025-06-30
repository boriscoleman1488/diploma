import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface Rating {
  id: string
  rating: number
  created_at: string
  updated_at: string
  dishes: {
    id: string
    title: string
    status: string
  }
  profiles: {
    id: string
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
}

interface RatingStats {
  total: number
  likes: number
  dislikes: number
  likeRatio: number
  weekly: {
    total: number
    likes: number
    dislikes: number
  }
  monthly: {
    total: number
    likes: number
    dislikes: number
  }
}

export function useAdminRatings() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dishFilter, setDishFilter] = useState<string>('')
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([])
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchRatings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/ratings')
      if (response.success && response.ratings) {
        setRatings(response.ratings)
        setFilteredRatings(response.ratings)
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити рейтинги')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/ratings/stats/overview')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  const handleViewRating = useCallback(async (ratingId: string) => {
    try {
      const response = await apiClient.get(`/admin/ratings/${ratingId}`)
      if (response.success && response.rating) {
        setSelectedRating(response.rating)
        setShowDetailsModal(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch rating details:', error)
      toast.error('Не вдалося завантажити деталі рейтингу')
      return false
    }
  }, [])

  const handleDeleteRating = useCallback(async (ratingId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/ratings/${ratingId}`)
      
      if (response.success) {
        toast.success('Рейтинг видалено успішно')
        
        // Remove from ratings list
        setRatings(prev => prev.filter(rating => rating.id !== ratingId))
        
        // Close modal if this rating was selected
        if (selectedRating?.id === ratingId) {
          setShowDetailsModal(false)
          setSelectedRating(null)
        }
        
        // Refresh stats
        fetchStats()
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити рейтинг')
        return false
      }
    } catch (error) {
      console.error('Failed to delete rating:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити рейтинг')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchStats, selectedRating])

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedRating(null)
  }, [])

  // Apply filters when search query or dish filter changes
  useEffect(() => {
    let filtered = ratings

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(rating =>
        rating.dishes.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by dish status
    if (dishFilter) {
      filtered = filtered.filter(rating => rating.dishes.status === dishFilter)
    }

    setFilteredRatings(filtered)
  }, [searchQuery, dishFilter, ratings])

  // Fetch ratings and stats on mount
  useEffect(() => {
    fetchRatings()
    fetchStats()
  }, [fetchRatings, fetchStats])

  return {
    ratings,
    filteredRatings,
    stats,
    isLoading,
    isUpdating,
    searchQuery,
    dishFilter,
    selectedRating,
    showDetailsModal,
    setSearchQuery,
    setDishFilter,
    fetchRatings,
    fetchStats,
    handleViewRating,
    handleDeleteRating,
    closeDetailsModal
  }
}