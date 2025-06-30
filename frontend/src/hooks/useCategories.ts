import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Category } from '@/types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/categories')
      if (response.success && response.categories) {
        setCategories(response.categories)
      } else {
        setError(response.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    fetchCategories
  }
}