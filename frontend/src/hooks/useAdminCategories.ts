import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Category } from '@/types/category'
import toast from 'react-hot-toast'

interface CategoryStats {
  totalCategories: number
  totalDishes: number
  emptyCategories: number
  mostUsedCategories: Category[]
  recentCategories: Category[]
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/categories')
      if (response.success && response.categories) {
        // Ensure dishes_count is a number for each category
        const categoriesWithCounts = response.categories.map(category => ({
          ...category,
          dishes_count: typeof category.dishes_count === 'number' ? category.dishes_count : 
                        typeof category.dishes_count === 'string' ? parseInt(category.dishes_count, 10) : 0
        }));
        
        setCategories(categoriesWithCounts)
        setFilteredCategories(categoriesWithCounts)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити категорії')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCategoryStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const response = await apiClient.get('/admin/categories/stats')
      if (response.success && response.stats) {
        // Ensure all numeric values are properly parsed
        const parsedStats = {
          ...response.stats,
          totalCategories: Number(response.stats.totalCategories),
          totalDishes: Number(response.stats.totalDishes),
          emptyCategories: Number(response.stats.emptyCategories),
          mostUsedCategories: response.stats.mostUsedCategories.map((cat: any) => ({
            ...cat,
            dishes_count: typeof cat.dishes_count === 'number' ? cat.dishes_count : 
                          typeof cat.dishes_count === 'string' ? parseInt(cat.dishes_count, 10) : 0
          })),
          recentCategories: response.stats.recentCategories.map((cat: any) => ({
            ...cat,
            dishes_count: typeof cat.dishes_count === 'number' ? cat.dishes_count : 
                          typeof cat.dishes_count === 'string' ? parseInt(cat.dishes_count, 10) : 0
          }))
        };
        
        setStats(parsedStats)
      }
    } catch (error) {
      console.error('Failed to fetch category stats:', error)
      // Don't show error toast for stats as it's not critical
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  const handleDeleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити категорію "${categoryName}"?`)) {
      return false
    }

    setIsDeleting(categoryId)
    try {
      const response = await apiClient.delete(`/admin/categories/${categoryId}`)
      if (response.success) {
        toast.success('Категорію успішно видалено')
        fetchCategories()
        fetchCategoryStats()
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити категорію')
        return false
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити категорію')
      return false
    } finally {
      setIsDeleting(null)
    }
  }, [fetchCategories, fetchCategoryStats])

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category)
    setShowEditModal(true)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false)
    setEditingCategory(null)
  }, [])

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  // Fetch categories and stats on mount
  useEffect(() => {
    fetchCategories()
    fetchCategoryStats()
  }, [fetchCategories, fetchCategoryStats])

  return {
    categories,
    filteredCategories,
    stats,
    isLoading,
    isLoadingStats,
    isDeleting,
    searchQuery,
    showCreateModal,
    showEditModal,
    editingCategory,
    setSearchQuery,
    setShowCreateModal,
    handleDeleteCategory,
    handleEditCategory,
    handleCloseEditModal,
    fetchCategories,
    fetchCategoryStats
  }
}