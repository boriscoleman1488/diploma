'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Heart, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface RatingStats {
  likes: number
  total: number
  ratio: number
}

interface RatingSectionProps {
  dishId: string
  className?: string
  onRatingChange?: (stats: RatingStats) => void
}

export function RatingSection({ dishId, className = '', onRatingChange }: RatingSectionProps) {
  const [stats, setStats] = useState<RatingStats>({ likes: 0, total: 0, ratio: 0 })
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchRatingStats = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/ratings/${dishId}`)
      if (response.success && response.stats) {
        setStats(response.stats)
        if (onRatingChange) {
          onRatingChange(response.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRating = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.get(`/ratings/dishes/${dishId}/my-rating`)
      if (response.success) {
        setUserRating(response.rating)
      }
    } catch (error) {
      console.error('Failed to fetch user rating:', error)
    }
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Щоб поставити лайк, потрібно увійти в систему')
      return
    }

    setIsUpdating(true)
    try {
      const newRating = userRating === 1 ? 0 : 1 // Toggle between like (1) and no rating (0)
      
      const response = await apiClient.post(`/ratings/${dishId}`, {
        rating: newRating
      })

      if (response.success) {
        setUserRating(newRating)
        
        // Update stats optimistically
        const newStats = {
          ...stats,
          likes: newRating === 1 ? stats.likes + 1 : Math.max(0, stats.likes - 1),
          total: newRating === 1 && userRating !== 1 ? stats.total + 1 : 
                 newRating === 0 && userRating === 1 ? Math.max(0, stats.total - 1) : stats.total
        }
        newStats.ratio = newStats.total > 0 ? newStats.likes / newStats.total : 0
        setStats(newStats)
        
        if (onRatingChange) {
          onRatingChange(newStats)
        }

        toast.success(newRating === 1 ? 'Лайк додано!' : 'Лайк видалено!')
      } else {
        toast.error(response.message || 'Не вдалося оновити рейтинг')
      }
    } catch (error) {
      console.error('Failed to update rating:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося оновити рейтинг')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchRatingStats()
    fetchUserRating()
  }, [dishId, isAuthenticated])

  const isLiked = userRating === 1

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        {/* Like Button */}
        <Button
          variant={isLiked ? "primary" : "outline"}
          onClick={handleToggleLike}
          disabled={isUpdating || !isAuthenticated}
          leftIcon={
            isUpdating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            )
          }
          className={`transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
              : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600'
          }`}
        >
          {isUpdating ? 'Оновлення...' : isLiked ? 'Подобається' : 'Подобається'}
        </Button>

        {/* Stats Display */}
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1 text-red-500" />
              <span className="font-medium">{stats.likes}</span>
            </div>
            
            {stats.total > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span>{Math.round(stats.ratio * 100)}% позитивних</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Auth Message */}
      {!isAuthenticated && (
        <p className="text-xs text-gray-500 mt-2">
          Увійдіть в систему, щоб поставити лайк
        </p>
      )}
    </div>
  )
}