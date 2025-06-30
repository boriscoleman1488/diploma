import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Collection } from '@/types/collection'
import { Dish } from '@/types/dish'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useCollectionDetail(collectionId: string) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  const fetchCollection = useCallback(async () => {
    if (!isAuthenticated || !collectionId) return

    setIsLoading(true)
    try {
      const response = await apiClient.get(`/collections/${collectionId}`)
      if (response.success && response.collection) {
        setCollection(response.collection)
        setDishes(response.dishes || [])
        setFilteredDishes(response.dishes || [])
      } else {
        toast.error('Колекцію не знайдено')
        router.push('/collections')
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити колекцію')
      router.push('/collections')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, collectionId, router])

  const updateCollection = async (name: string, description?: string) => {
    if (!collection) return false

    try {
      const response = await apiClient.put(`/collections/${collection.id}`, {
        name: name.trim(),
        description: description?.trim() || undefined
      })
      
      if (response.success) {
        toast.success('Колекцію успішно оновлено')
        fetchCollection()
        return true
      } else {
        toast.error(response.error || 'Не вдалося оновити колекцію')
        return false
      }
    } catch (error) {
      console.error('Failed to update collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося оновити колекцію')
      return false
    }
  }

  const removeDish = async (dishId: string) => {
    if (!collection) return false
    
    if (!confirm('Ви впевнені, що хочете видалити цю страву з колекції?')) {
      return false
    }

    setIsRemoving(dishId)
    try {
      const response = await apiClient.delete(`/collections/${collection.id}/dishes/${dishId}`)
      if (response.success) {
        toast.success('Страву видалено з колекції')
        setDishes(prev => prev.filter(dish => dish.id !== dishId))
        setFilteredDishes(prev => prev.filter(dish => dish.id !== dishId))
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити страву з колекції')
        return false
      }
    } catch (error) {
      console.error('Failed to remove dish from collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити страву з колекції')
      return false
    } finally {
      setIsRemoving(null)
    }
  }

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = dishes.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDishes(filtered)
    } else {
      setFilteredDishes(dishes)
    }
  }, [searchQuery, dishes])

  // Fetch collection on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && collectionId) {
      fetchCollection()
    }
  }, [isAuthenticated, collectionId, fetchCollection])

  return {
    collection,
    dishes,
    filteredDishes,
    isLoading,
    searchQuery,
    setSearchQuery,
    isRemoving,
    showEditModal,
    setShowEditModal,
    isOwner: collection && user ? collection.user_id === user.id : false,
    fetchCollection,
    updateCollection,
    removeDish,
    getTotalCookingTime: (dish: Dish) => {
      if (!dish.steps || !Array.isArray(dish.steps)) return null
      const total = dish.steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
      return total > 0 ? total : null
    },
    getDishCategories: (dish: Dish) => {
      if (!dish.categories || !Array.isArray(dish.categories)) return []
      
      return dish.categories
        .map(categoryRelation => {
          if (categoryRelation && typeof categoryRelation === 'object') {
            if (categoryRelation.dish_categories && categoryRelation.dish_categories.name) {
              return categoryRelation.dish_categories
            }
            if (categoryRelation.name) {
              return categoryRelation
            }
          }
          return null
        })
        .filter(Boolean)
    }
  }
}