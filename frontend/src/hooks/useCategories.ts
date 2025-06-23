import { useState, useEffect } from 'react'
import { Category, CreateCategoryData, UpdateCategoryData, CategoriesResponse, CategoryResponse } from '@/types/category'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response: CategoriesResponse = await apiClient.get('/categories')
      
      if (response.success && response.categories) {
        setCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити категорії')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategoryById = async (categoryId: string) => {
    setIsLoading(true)
    try {
      const response: CategoryResponse = await apiClient.get(`/categories/${categoryId}`)
      
      if (response.success && response.category) {
        setSelectedCategory(response.category)
        return response.category
      }
      return null
    } catch (error) {
      console.error('Failed to fetch category:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити категорію')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (data: CreateCategoryData) => {
    setIsUpdating(true)
    try {
      const response: CategoryResponse = await apiClient.post('/categories', data)
      
      if (response.success && response.category) {
        setCategories(prev => [...prev, response.category!])
        toast.success('Категорію створено успішно')
        return { success: true, category: response.category }
      }
      return { success: false, error: response.error || 'Не вдалося створити категорію' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося створити категорію'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const searchCategories = async (query: string) => {
    if (!query.trim()) {
      return { success: true, categories: [] }
    }

    try {
      const response: CategoriesResponse = await apiClient.get(`/categories/search/${encodeURIComponent(query)}`)
      
      if (response.success && response.categories) {
        return { success: true, categories: response.categories }
      }
      return { success: false, error: response.error || 'Пошук не вдався' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Пошук не вдався'
      return { success: false, error: errorMessage }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    selectedCategory,
    isLoading,
    isUpdating,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    searchCategories,
    setSelectedCategory,
  }
}