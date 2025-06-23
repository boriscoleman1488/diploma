'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCategories } from '@/hooks/useCategories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  ArrowLeft, 
  ChefHat, 
  Calendar, 
  Hash,
  Clock,
  User,
  Heart,
  MessageCircle
} from 'lucide-react'

export default function CategoryDetailsPage() {
  const params = useParams()
  const categoryId = params.categoryId as string
  const [dishes, setDishes] = useState<any[]>([])
  const [isLoadingDishes, setIsLoadingDishes] = useState(false)
  
  const {
    selectedCategory,
    isLoading,
    fetchCategoryById,
  } = useCategories()

  useEffect(() => {
    if (categoryId) {
      fetchCategoryById(categoryId)
    }
  }, [categoryId])

  // Mock dishes data - в реальному додатку це буде API запит
  useEffect(() => {
    if (selectedCategory) {
      setIsLoadingDishes(true)
      // Симуляція завантаження страв
      setTimeout(() => {
        setDishes([
          {
            id: '1',
            title: 'Борщ український',
            description: 'Традиційний український борщ з м\'ясом та сметаною',
            main_image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
            servings: 4,
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Марія Петренко', profile_tag: 'maria_cook' },
            ratings: [{ rating_type: 1 }, { rating_type: 1 }],
            comments_count: 5
          },
          {
            id: '2',
            title: 'Вареники з картоплею',
            description: 'Домашні вареники з картопляною начинкою',
            main_image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
            servings: 6,
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Олександр Коваль', profile_tag: 'alex_chef' },
            ratings: [{ rating_type: 1 }],
            comments_count: 3
          }
        ])
        setIsLoadingDishes(false)
      }, 1000)
    }
  }, [selectedCategory])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження категорії...</p>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Категорію не знайдено
          </h1>
          <p className="text-gray-600 mb-4">
            Запитувана категорія не існує або була видалена.
          </p>
          <Link href="/categories">
            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Повернутися до категорій
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/categories" className="hover:text-primary-600">
              Категорії
            </Link>
            <span>/</span>
            <span className="text-gray-900">{selectedCategory.name}</span>
          </div>

          {/* Back Button */}
          <Link href="/categories">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Повернутися до категорій
            </Button>
          </Link>

          {/* Category Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-primary-100 rounded-full">
                  <ChefHat className="w-12 h-12 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCategory.name}
                  </h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {selectedCategory.description || 'Без опису'}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 mr-1" />
                      {selectedCategory.dishes_count || 0} рецептів
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Створено {formatDate(selectedCategory.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Оновлено {formatRelativeTime(selectedCategory.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dishes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="w-5 h-5 mr-2" />
                Рецепти в категорії
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDishes ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : dishes.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Немає рецептів
                  </h3>
                  <p className="text-gray-600 mb-4">
                    У цій категорії поки що немає рецептів.
                  </p>
                  <Button>
                    Створити перший рецепт
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dishes.map((dish) => (
                    <Card key={dish.id} className="hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={dish.main_image_url}
                          alt={dish.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {dish.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {dish.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {dish.profiles.full_name}
                          </div>
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            {dish.servings} порцій
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {dish.ratings.length}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {dish.comments_count}
                            </div>
                          </div>
                          <Button size="sm">
                            Переглянути
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}