'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { BookOpen, Plus, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description?: string
  collection_type: 'custom' | 'system'
  system_type?: 'my_dishes' | 'liked' | 'published' | 'private'
}

interface AddToCollectionButtonProps {
  dishId: string
  className?: string
}

export function AddToCollectionButton({ dishId, className = '' }: AddToCollectionButtonProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  const fetchCollections = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await apiClient.get('/collections')
      if (response.success && response.collections) {
        // Filter out system collections except for 'liked'
        const filteredCollections = response.collections.filter(
          collection => collection.collection_type !== 'system' || collection.system_type === 'liked'
        )
        setCollections(filteredCollections)
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCollection = async (collectionId: string) => {
    setIsAdding(true)
    setSelectedCollection(collectionId)
    try {
      const response = await apiClient.post(`/collections/dishes/${collectionId}`, {
        dishId
      })
      
      if (response.success) {
        toast.success('Страву додано до колекції')
        setTimeout(() => {
          setShowDropdown(false)
          setSelectedCollection(null)
        }, 1000)
      } else {
        if (response.error?.includes('already in collection')) {
          toast.error('Страва вже є в цій колекції')
        } else {
          toast.error(response.error || 'Не вдалося додати страву до колекції')
        }
        setSelectedCollection(null)
      }
    } catch (error) {
      console.error('Failed to add dish to collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося додати страву до колекції')
      setSelectedCollection(null)
    } finally {
      setIsAdding(false)
    }
  }

  useEffect(() => {
    if (showDropdown) {
      fetchCollections()
    }
  }, [showDropdown])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('collection-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`relative ${className}`} id="collection-dropdown">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        leftIcon={<BookOpen className="w-4 h-4" />}
        className="w-full"
      >
        Додати до колекції
      </Button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Вибрати колекцію</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : collections.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>У вас ще немає колекцій</p>
                <Link href="/collections" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Створити колекцію
                </Link>
              </div>
            ) : (
              <div className="py-1">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => addToCollection(collection.id)}
                    disabled={isAdding && selectedCollection === collection.id}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>{collection.name}</span>
                    {isAdding && selectedCollection === collection.id ? (
                      <LoadingSpinner size="sm" />
                    ) : selectedCollection === collection.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200">
            <Link href="/collections">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Створити нову колекцію
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}