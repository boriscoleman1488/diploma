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
import { Dish } from '@/types/dish'
import { 
  ChefHat, 
  Search, 
  Plus, 
  Clock,
  Users,
  Heart,
  MessageCircle,
  Filter,
  Grid3X3,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function UserDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const { user } = useAuthStore()

  const fetchUserDishes = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/collections/type/my_dishes')
      if (response.success && response.dishes) {
        setDishes(response.dishes)
        setFilteredDishes(response.dishes)
      }
    } catch (error) {
      console.error('Failed to fetch user dishes:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю страву? Ця дія незворотна.')) {
      return
    }

    try {
      const response = await apiClient.delete(`/dishes/${dishId}`)
      if (response.success) {
        toast.success('Страву успішно видалено')
        fetchUserDishes()
      } else {
        toast.error(response.error || 'Не вдалося видалити страву')
      }
    } catch (error) {
      console.error('Failed to delete dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити страву')
    }
  }

  const handleSubmitForReview = async (dishId: string) => {
    try {
      const response = await apiClient.patch(`/dishes/${dishId}/status`, {
        action: 'submit_for_review'
      })
      
      if (response.success) {
        toast.success('Страву відправлено на модерацію')
        fetchUserDishes()
      } else {
        toast.error(response.error || 'Не вдалося відправити страву на модерацію')
      }
    } catch (error) {
      console.error('Failed to submit dish for review:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося відправити страву на модерацію')
    }
  }

  useEffect(() => {
    fetchUserDishes()
  }, [])

  useEffect(() => {
    let filtered = dishes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(dish => dish.status === statusFilter)
    }

    setFilteredDishes(filtered)
  }, [searchQuery, statusFilter, dishes])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Чернетка', color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { label: 'На розгляді', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Схвалено', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Відхилено', color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/profile">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Назад до профілю
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Мої страви
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Керуйте вашими стравами, редагуйте та публікуйте їх
            </p>
          </div>
        </div>
        <Link href="/dishes/add">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Додати нову страву
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук страв за назвою або описом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Всі статуси</option>
                <option value="draft">Чернетки</option>
                <option value="pending">На розгляді</option>
                <option value="approved">Схвалено</option>
                <option value="rejected">Відхилено</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Завантаження страв...</p>
          </div>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statusFilter ? 'Страви не знайдено' : 'У вас ще немає страв'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter 
              ? 'Спробуйте змінити критерії пошуку або очистити фільтри'
              : 'Створіть свою першу страву прямо зараз!'
            }
          </p>
          {searchQuery || statusFilter ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('')
              }}
            >
              Очистити фільтри
            </Button>
          ) : (
            <Link href="/dishes/add">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Створити першу страву
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const cookingTime = getTotalCookingTime(dish)
            const likesCount = dish.ratings?.filter(r => r.rating_type === 1).length || 0
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
                    {getStatusBadge(dish.status)}
                  </div>
                  
                  {/* Rejection Reason */}
                  {dish.status === 'rejected' && dish.rejection_reason && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-red-100 border border-red-200 rounded-lg p-2 text-xs text-red-800">
                        <div className="flex items-start">
                          <AlertTriangle className="w-3 h-3 text-red-600 mr-1 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Причина відхилення:</p>
                            <p className="line-clamp-2">{dish.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
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
                          <Grid3X3 className="w-3 h-3 mr-1" />
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

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Link href={`/dishes/${dish.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Переглянути
                        </Button>
                      </Link>
                      <Link href={`/dishes/edit/${dish.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          leftIcon={<Edit className="w-4 h-4" />}
                        >
                          Редагувати
                        </Button>
                      </Link>
                    </div>
                    
                    {dish.status === 'draft' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitForReview(dish.id)}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Відправити на модерацію
                      </Button>
                    )}
                    
                    {dish.status === 'rejected' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitForReview(dish.id)}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Відправити повторно
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDish(dish.id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Видалити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}