import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Category } from '@/types/category'
import toast from 'react-hot-toast'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/categories')
      if (response.success && response.categories) {
        setCategories(response.categories)
        setFilteredCategories(response.categories)
      } else {
        setError(response.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
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

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    filteredCategories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fetchCategories
  }
}