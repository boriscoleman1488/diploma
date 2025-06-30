import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { Collection } from '@/types/collection'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  const fetchCollections = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await apiClient.get('/collections')
      if (response.success && response.collections) {
        setCollections(response.collections)
        setFilteredCollections(response.collections)
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити колекції')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const createCollection = async (name: string, description?: string) => {
    try {
      const response = await apiClient.post('/collections', {
        name: name.trim(),
        description: description?.trim() || undefined,
      })
      
      if (response.success) {
        toast.success('Колекцію успішно створено')
        fetchCollections()
        return true
      } else {
        toast.error(response.error || 'Не вдалося створити колекцію')
        return false
      }
    } catch (error) {
      console.error('Failed to create collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося створити колекцію')
      return false
    }
  }

  const deleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити колекцію "${collectionName}"?`)) {
      return false
    }

    setIsDeleting(collectionId)
    try {
      const response = await apiClient.delete(`/collections/${collectionId}`)
      if (response.success) {
        toast.success('Колекцію успішно видалено')
        fetchCollections()
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити колекцію')
        return false
      }
    } catch (error) {
      console.error('Failed to delete collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити колекцію')
      return false
    } finally {
      setIsDeleting(null)
    }
  }

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCollections(filtered)
    } else {
      setFilteredCollections(collections)
    }
  }, [searchQuery, collections])

  // Fetch collections on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections()
    }
  }, [isAuthenticated, fetchCollections])

  return {
    collections,
    filteredCollections,
    isLoading,
    searchQuery,
    setSearchQuery,
    showCreateModal,
    setShowCreateModal,
    isDeleting,
    fetchCollections,
    createCollection,
    deleteCollection,
    getCollectionItemsCount: (collection: Collection) => collection.dish_collection_items?.length || 0
  }
}