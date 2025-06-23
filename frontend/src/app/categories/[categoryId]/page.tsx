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
  MessageCircle,
  Sparkles,
  TrendingUp,
  Star,
  BookOpen
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
          <p className="mt-4 text-gray-600 text-lg">Завантаження категорії...</p>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Error Header */}
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-8xl mb-6">❌</div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Категорію не знайдено
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Запитувана категорія не існує або була видалена
              </p>
              <Link href="/categories">
                <Button 
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-50"
                  leftIcon={<ArrowLeft className="w-5 h-5" />}
                >
                  Повернутися до категорій
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-white/80 mb-8">
            <Link href="/categories" className="hover:text-white transition-colors">
              Категорії
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{selectedCategory.name}</span>
          </div>

          <div className="flex items-center space-x-8">
            {/* Category Icon */}
            <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl">
              <ChefHat className="w-16 h-16 text-white" />
            </div>
            
            <div className="flex-1">
              {/* Category Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {selectedCategory.name}
                <Sparkles className="inline-block w-8 h-8 ml-3 text-yellow-300" />
              </h1>
              
              {/* Description */}
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {selectedCategory.description || 'Колекція найкращих рецептів у цій категорії'}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Hash className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{selectedCategory.dishes_count || 0}</span>
                  <span className="ml-1">рецептів</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Створено {formatDate(selectedCategory.created_at)}</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Оновлено {formatRelativeTime(selectedCategory.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/categories">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Повернутися до категорій
            </Button>
          </Link>

          {/* Dishes Section */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="w-6 h-6 mr-3 text-primary-600" />
                Рецепти в категорії
                <span className="ml-auto bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {dishes.length} рецептів
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isLoadingDishes ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 text-lg">Завантаження рецептів...</p>
                  </div>
                </div>
              ) : dishes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">🍽️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Немає рецептів
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    У цій категорії поки що немає рецептів. Станьте першим, хто поділиться своїм кулінарним шедевром!
                  </p>
                  <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                    Створити перший рецепт
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {dishes.map((dish) => (
                    <Card key={dish.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden rounded-t-lg">
                        <img
                          src={dish.main_image_url}
                          alt={dish.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {dish.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {dish.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1 text-red-500" />
                              {dish.ratings.length}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
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

          {/* Category Stats */}
          {dishes.length > 0 && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="w-6 h-6 mr-3 text-primary-600" />
                  Статистика категорії
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {dishes.length}
                    </div>
                    <div className="text-gray-600 font-medium">Рецептів</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {dishes.reduce((sum, dish) => sum + dish.ratings.length, 0)}
                    </div>
                    <div className="text-gray-600 font-medium">Лайків</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {dishes.reduce((sum, dish) => sum + dish.comments_count, 0)}
                    </div>
                    <div className="text-gray-600 font-medium">Коментарів</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(dishes.reduce((sum, dish) => sum + dish.servings, 0) / dishes.length) || 0}
                    </div>
                    <div className="text-gray-600 font-medium">Середньо порцій</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}