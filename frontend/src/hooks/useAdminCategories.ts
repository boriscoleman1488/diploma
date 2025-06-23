import { useState, useEffect } from 'react'
import { Category, CreateCategoryData, UpdateCategoryData, CategoriesResponse, CategoryResponse } from '@/types/category'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response: CategoriesResponse = await apiClient.get('/admin/categories')
      
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

  const createCategory = async (data: CreateCategoryData) => {
    setIsUpdating(true)
    try {
      const response: CategoryResponse = await apiClient.post('/admin/categories', data)
      
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

  const updateCategory = async (categoryId: string, data: UpdateCategoryData) => {
    setIsUpdating(true)
    try {
      const response: CategoryResponse = await apiClient.put(`/admin/categories/${categoryId}`, data)
      
      if (response.success && response.category) {
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId ? response.category! : cat
        ))
        
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(response.category)
        }
        
        toast.success('Категорію оновлено успішно')
        return { success: true, category: response.category }
      }
      return { success: false, error: response.error || 'Не вдалося оновити категорію' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося оновити категорію'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/categories/${categoryId}`)
      
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        
        if (selectedCategory?.id === categoryId) {
          setSelectedCategory(null)
        }
        
        toast.success('Категорію видалено успішно')
        return { success: true }
      }
      return { success: false, error: response.error || 'Не вдалося видалити категорію' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося видалити категорію'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
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
    createCategory,
    updateCategory,
    deleteCategory,
    setSelectedCategory,
  }
}