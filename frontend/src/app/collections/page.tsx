'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Avatar } from '@/components/ui/Avatar'
import { apiClient } from '@/lib/api'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { 
  BookOpen, 
  Search, 
  Plus, 
  ChefHat,
  Heart,
  Clock,
  Users,
  Grid3X3,
  Eye,
  Trash2,
  Edit,
  FolderPlus,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description?: string
  collection_type: 'custom' | 'system'
  system_type?: 'my_dishes' | 'liked' | 'published' | 'private'
  created_at: string
  updated_at: string
  dish_collection_items?: Array<{
    dish_id: string
    added_at: string
    dishes: {
      id: string
      title: string
      main_image_url?: string
      status: string
    }
  }>
}

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateCollectionModal({ isOpen, onClose, onSuccess }: CreateCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Назва колекції є обов\'язковою')
      return
    }

    setIsCreating(true)
    try {
      const response = await apiClient.post('/collections', {
        name: name.trim(),
        description: description.trim() || undefined
      })
      
      if (response.success) {
        toast.success('Колекцію успішно створено')
        setName('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        toast.error(response.error || 'Не вдалося створити колекцію')
      }
    } catch (error) {
      console.error('Failed to create collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося створити колекцію')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Створити нову колекцію
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Назва колекції *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введіть назву колекції"
              disabled={isCreating}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Опис (необов'язково)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введіть опис колекції"
              disabled={isCreating}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
              leftIcon={isCreating ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />}
            >
              {isCreating ? 'Створення...' : 'Створити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  const fetchCollections = async () => {
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
  }

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити колекцію "${collectionName}"?`)) {
      return
    }

    setIsDeleting(collectionId)
    try {
      const response = await apiClient.delete(`/collections/${collectionId}`)
      if (response.success) {
        toast.success('Колекцію успішно видалено')
        fetchCollections()
      } else {
        toast.error(response.error || 'Не вдалося видалити колекцію')
      }
    } catch (error) {
      console.error('Failed to delete collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити колекцію')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCreateSuccess = () => {
    fetchCollections()
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections()
    }
  }, [isAuthenticated])

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

  const getSystemCollectionIcon = (systemType?: string) => {
    switch (systemType) {
      case 'my_dishes':
        return <ChefHat className="w-5 h-5 text-primary-600" />
      case 'liked':
        return <Heart className="w-5 h-5 text-red-600" />
      case 'published':
        return <Eye className="w-5 h-5 text-green-600" />
      case 'private':
        return <BookOpen className="w-5 h-5 text-blue-600" />
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />
    }
  }

  const getSystemCollectionName = (systemType?: string) => {
    switch (systemType) {
      case 'my_dishes':
        return 'Мої страви'
      case 'liked':
        return 'Улюблені'
      case 'published':
        return 'Опубліковані'
      case 'private':
        return 'Приватні'
      default:
        return 'Колекція'
    }
  }

  const getCollectionItemsCount = (collection: Collection) => {
    return collection.dish_collection_items?.length || 0
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Увійдіть, щоб переглянути колекції
        </h2>
        <p className="text-gray-600 mb-6">
          Для доступу до колекцій страв потрібно увійти в систему
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/auth/login">
            <Button>Увійти</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline">Зареєструватися</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Мої колекції
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Керуйте вашими колекціями страв
          </p>
        </div>
        <Button
          leftIcon={<FolderPlus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Створити колекцію
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук колекцій..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Колекції не знайдено' : 'У вас ще немає колекцій'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Спробуйте змінити пошуковий запит' 
              : 'Створіть свою першу колекцію страв'
            }
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setShowCreateModal(true)}
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Створити колекцію
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => {
            const isSystemCollection = collection.collection_type === 'system'
            const itemsCount = getCollectionItemsCount(collection)
            
            return (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getSystemCollectionIcon(collection.system_type)}
                      <span className="ml-2">{collection.name}</span>
                    </div>
                    {!isSystemCollection && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDeleteCollection(collection.id, collection.name)}
                          disabled={isDeleting === collection.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {isDeleting === collection.id ? 'Видалення...' : 'Видалити'}
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {collection.description && (
                      <p className="text-sm text-gray-600">
                        {collection.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <ChefHat className="w-4 h-4 mr-1" />
                        {itemsCount} {itemsCount === 1 ? 'страва' : itemsCount > 1 && itemsCount < 5 ? 'страви' : 'страв'}
                      </div>
                    </div>
                    
                    {/* Preview of dishes */}
                    {itemsCount > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex -space-x-2 overflow-hidden">
                          {collection.dish_collection_items?.slice(0, 5).map((item) => (
                            <div key={item.dish_id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200">
                              {item.dishes.main_image_url ? (
                                <img
                                  src={item.dishes.main_image_url}
                                  alt={item.dishes.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ChefHat className="h-full w-full p-1 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {itemsCount > 5 && (
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
                              <span className="text-xs font-medium text-gray-500">+{itemsCount - 5}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Link href={`/collections/${collection.id}`}>
                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Переглянути колекцію
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}