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
  const [dishesFromCategory, setDishesFromCategory] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
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
      if (response.success) {
        setCategories(response.categories || [])
        setFilteredCategories(response.categories || [])
        setDishesFromCategory(response.dishesFromCategory || {})
        
        // Set stats from the response data
        setStats({
          totalCategories: response.totalCategories || 0,
          totalDishes: response.totalDishes || 0,
          emptyCategories: response.emptyCategories || 0,
          mostUsedCategories: [],
          recentCategories: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити категорії')
    } finally {
      setIsLoading(false)
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
  }, [fetchCategories])

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

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    filteredCategories,
    stats,
    dishesFromCategory,
    isLoading,
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
    fetchCategories
  }
}