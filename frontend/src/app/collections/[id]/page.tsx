'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  ChefHat,
  Heart,
  Clock,
  Users,
  Grid3X3,
  Eye,
  Trash2,
  ArrowLeft,
  Edit,
  X,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
}

interface Dish {
  id: string
  title: string
  description: string
  main_image_url?: string
  servings: number
  status: string
  created_at: string
  updated_at: string
  user_id: string
  profiles?: {
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
  categories?: Array<{
    dish_categories: {
      id: string
      name: string
    }
  }>
  ratings?: Array<{
    rating: number
  }>
  comments_count?: number
  added_to_collection_at?: string
}

interface EditCollectionModalProps {
  collection: Collection | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function EditCollectionModal({ collection, isOpen, onClose, onSuccess }: EditCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isOpen && collection) {
      setName(collection.name)
      setDescription(collection.description || '')
    }
  }, [isOpen, collection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Назва колекції є обов\'язковою')
      return
    }

    setIsUpdating(true)
    try {
      const response = await apiClient.put(`/collections/${collection?.id}`, {
        name: name.trim(),
        description: description.trim() || undefined
      })
      
      if (response.success) {
        toast.success('Колекцію успішно оновлено')
        onSuccess()
        onClose()
      } else {
        toast.error(response.error || 'Не вдалося оновити колекцію')
      }
    } catch (error) {
      console.error('Failed to update collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося оновити колекцію')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      onClose()
    }
  }

  if (!isOpen || !collection) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Редагувати колекцію
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isUpdating}
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
              disabled={isUpdating}
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
              disabled={isUpdating}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !name.trim()}
              leftIcon={isUpdating ? <LoadingSpinner size="sm" /> : <Edit className="w-4 h-4" />}
            >
              {isUpdating ? 'Оновлення...' : 'Оновити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CollectionDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  const fetchCollection = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/collections/${id}`)
      if (response.success && response.collection) {
        setCollection(response.collection)
        setDishes(response.dishes || [])
        setFilteredDishes(response.dishes || [])
      } else {
        toast.error('Колекцію не знайдено')
        router.push('/collections')
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити колекцію')
      router.push('/collections')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDish = async (dishId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю страву з колекції?')) {
      return
    }

    setIsRemoving(dishId)
    try {
      const response = await apiClient.delete(`/collections/${id}/dishes/${dishId}`)
      if (response.success) {
        toast.success('Страву видалено з колекції')
        setDishes(prev => prev.filter(dish => dish.id !== dishId))
        setFilteredDishes(prev => prev.filter(dish => dish.id !== dishId))
      } else {
        toast.error(response.error || 'Не вдалося видалити страву з колекції')
      }
    } catch (error) {
      console.error('Failed to remove dish from collection:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити страву з колекції')
    } finally {
      setIsRemoving(null)
    }
  }

  const handleEditSuccess = () => {
    fetchCollection()
  }

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchCollection()
    }
  }, [isAuthenticated, id])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = dishes.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDishes(filtered)
    } else {
      setFilteredDishes(dishes)
    }
  }, [searchQuery, dishes])

  const isOwner = collection && user && collection.user_id === user.id

  const getTotalCookingTime = (dish: Dish) => {
    if (!dish.steps || !Array.isArray(dish.steps)) return null
    const total = dish.steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
    return total > 0 ? total : null
  }

  const getDishCategories = (dish: Dish) => {
    if (!dish.categories || !Array.isArray(dish.categories)) return []
    
    return dish.categories
      .map(categoryRelation => {
        if (categoryRelation && typeof categoryRelation === 'object') {
          if (categoryRelation.dish_categories && categoryRelation.dish_categories.name) {
            return categoryRelation.dish_categories
          }
          if (categoryRelation.name) {
            return categoryRelation
          }
        }
        return null
      })
      .filter(Boolean)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження колекції...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Колекцію не знайдено
        </h2>
        <p className="text-gray-600 mb-6">
          Колекція, яку ви шукаєте, не існує або була видалена
        </p>
        <Link href="/collections">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Повернутися до колекцій
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/collections">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 text-gray-600 mr-2" />
              <span className="ml-2">{collection.name}</span>
            </h1>
            {collection.description && (
              <p className="mt-1 text-gray-600">{collection.description}</p>
            )}
          </div>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => setShowEditModal(true)}
          >
            Редагувати
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук страв у колекції..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Страви не знайдено' : 'У цій колекції ще немає страв'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Спробуйте змінити пошуковий запит' 
              : 'Додайте страви до цієї колекції'
            }
          </p>
          {!searchQuery && (
            <Link href="/dishes">
              <Button leftIcon={<ChefHat className="w-4 h-4" />}>
                Переглянути страви
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const cookingTime = getTotalCookingTime(dish)
            const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
            const dishCategories = getDishCategories(dish)

            return (
              <Card key={dish.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                {/* Image */}
                <div className="aspect-video bg-gray-200 overflow-hidden relative">
                  {dish.main_image_url ? (
                    <img
                      src={dish.main_image_url}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      dish.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : dish.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dish.status === 'approved' ? 'Схвалено' : 
                       dish.status === 'pending' ? 'На розгляді' : 'Відхилено'}
                    </span>
                  </div>
                  
                  {/* Added Date Badge */}
                  {dish.added_to_collection_at && (
                    <div className="absolute bottom-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                        Додано {formatRelativeTime(dish.added_to_collection_at)}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                      {dish.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {dish.description}
                    </p>
                  </div>

                  {/* Categories */}
                  {dishCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {dishCategories.slice(0, 2).map((cat, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {dishCategories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{dishCategories.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {dish.servings}
                      </div>
                      {cookingTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {cookingTime}хв
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {likesCount}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {dish.comments_count || 0}
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={dish.profiles?.avatar_url}
                        name={dish.profiles?.full_name || dish.profiles?.email}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {dish.profiles?.full_name || 'Невідомий автор'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(dish.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dishes/${dish.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Переглянути
                        </Button>
                      </Link>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveDish(dish.id)}
                          disabled={isRemoving === dish.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {isRemoving === dish.id ? '...' : 'Видалити'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Collection Modal */}
      <EditCollectionModal
        collection={collection}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}