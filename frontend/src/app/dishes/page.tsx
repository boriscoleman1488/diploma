'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Avatar } from '@/components/ui/Avatar'
import { apiClient } from '@/lib/api'
import { formatDate, formatRelativeTime } from '@/lib/utils'
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
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])

  const fetchDishes = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/dishes')
      if (response.success && response.dishes) {
        setDishes(response.dishes)
        setFilteredDishes(response.dishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories')
      if (response.success && response.categories) {
        setCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  useEffect(() => {
    fetchDishes()
    fetchCategories()
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

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(dish =>
        dish.categories?.some(cat => cat.dish_categories.id === selectedCategory)
      )
    }

    setFilteredDishes(filtered)
  }, [searchQuery, selectedCategory, dishes])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Чернетка', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'На розгляді', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Опубліковано', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Відхилено', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTotalCookingTime = (dish: Dish) => {
    if (!dish.steps) return null
    const total = dish.steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
    return total > 0 ? total : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ChefHat className="w-8 h-8 mr-3" />
                Страви
              </h1>
              <p className="text-primary-100 mt-1">
                Відкрийте для себе дивовижні рецепти від нашої спільноти
              </p>
            </div>
            <Link href="/dishes/add">
              <Button 
                variant="secondary" 
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Додати страву
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ChefHat className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього страв</p>
                <p className="text-2xl font-bold text-gray-900">{dishes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Опубліковано</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dishes.filter(d => d.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На розгляді</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dishes.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid3X3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Категорій</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Всі категорії</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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
            {searchQuery || selectedCategory ? 'Страви не знайдено' : 'Немає страв'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory 
              ? 'Спробуйте змінити критерії пошуку'
              : 'Станьте першим, хто додасть страву!'
            }
          </p>
          {!searchQuery && !selectedCategory && (
            <Link href="/dishes/add">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Додати першу страву
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const cookingTime = getTotalCookingTime(dish)
            const likesCount = dish.ratings?.filter(r => r.rating_type === 1).length || 0

            return (
              <Card key={dish.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                {dish.main_image_url && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={dish.main_image_url}
                      alt={dish.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                        {dish.title}
                      </h3>
                      {getStatusBadge(dish.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {dish.description}
                  </p>

                  {/* Categories */}
                  {dish.categories && dish.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {dish.categories.slice(0, 3).map((cat, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {cat.dish_categories.name}
                        </span>
                      ))}
                      {dish.categories.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{dish.categories.length - 3} ще
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {dish.servings} порцій
                      </div>
                      {cookingTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {cookingTime} хв
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
                    <Button variant="outline" size="sm">
                      Переглянути
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