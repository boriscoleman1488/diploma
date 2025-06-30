import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Dish } from '@/types/dish'
import toast from 'react-hot-toast'

interface UseDishesOptions {
  initialCategory?: string
  initialSortBy?: string
  initialCookingTime?: string
  initialServingsCount?: string
  initialHasNutrition?: boolean
}

export function useDishes(options: UseDishesOptions = {}) {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(options.initialCategory || '')
  const [sortBy, setSortBy] = useState(options.initialSortBy || 'newest')
  const [cookingTime, setCookingTime] = useState(options.initialCookingTime || '')
  const [servingsCount, setServingsCount] = useState(options.initialServingsCount || '')
  const [hasNutrition, setHasNutrition] = useState(options.initialHasNutrition || false)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchDishes = useCallback(async () => {
    setIsLoading(true)
    try {
      let url = '/dishes'
      const params = new URLSearchParams()
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await apiClient.get(url)
      if (response.success && response.dishes) {
        // Filter only approved dishes for the homepage
        const approvedDishes = response.dishes.filter((dish: Dish) => dish.status === 'approved')
        setDishes(approvedDishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error('Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  const applyFilters = useCallback(() => {
    let filtered = [...dishes]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by cooking time
    if (cookingTime) {
      filtered = filtered.filter(dish => {
        const totalTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0
        
        if (cookingTime === 'quick') return totalTime > 0 && totalTime <= 30
        if (cookingTime === 'medium') return totalTime > 30 && totalTime <= 60
        if (cookingTime === 'long') return totalTime > 60
        
        return true
      })
    }

    // Filter by servings count
    if (servingsCount) {
      filtered = filtered.filter(dish => {
        const count = dish.servings || 0
        
        if (servingsCount === '1-2') return count >= 1 && count <= 2
        if (servingsCount === '3-4') return count >= 3 && count <= 4
        if (servingsCount === '5+') return count >= 5
        
        return true
      })
    }

    // Filter by nutrition info availability
    if (hasNutrition) {
      filtered = filtered.filter(dish => 
        dish.ingredients && dish.ingredients.length > 0
      )
    }

    // Sort dishes
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        if (sortBy === 'popular') {
          const aLikes = a.ratings?.filter(r => r.rating === 1).length || 0
          const bLikes = b.ratings?.filter(r => r.rating === 1).length || 0
          return bLikes - aLikes
        }
        if (sortBy === 'rating') {
          const aLikes = a.ratings?.filter(r => r.rating === 1).length || 0
          const bLikes = b.ratings?.filter(r => r.rating === 1).length || 0
          const aTotal = a.ratings?.length || 1
          const bTotal = b.ratings?.length || 1
          return (bLikes / bTotal) - (aLikes / aTotal)
        }
        return 0
      })
    }

    setFilteredDishes(filtered)
  }, [dishes, searchQuery, sortBy, cookingTime, servingsCount, hasNutrition])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('newest')
    setCookingTime('')
    setServingsCount('')
    setHasNutrition(false)
  }, [])

  const viewDishDetails = useCallback(async (dishId: string) => {
    try {
      const response = await apiClient.get(`/dishes/${dishId}`)
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

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedDish(null)
  }, [])

  // Fetch dishes when category changes
  useEffect(() => {
    fetchDishes()
  }, [fetchDishes])

  // Apply filters when any filter changes or dishes change
  useEffect(() => {
    applyFilters()
  }, [dishes, searchQuery, sortBy, cookingTime, servingsCount, hasNutrition, applyFilters])

  return {
    dishes,
    filteredDishes,
    isLoading,
    searchQuery,
    selectedCategory,
    sortBy,
    cookingTime,
    servingsCount,
    hasNutrition,
    selectedDish,
    showDetailsModal,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setCookingTime,
    setServingsCount,
    setHasNutrition,
    resetFilters,
    viewDishDetails,
    closeDetailsModal
  }
}