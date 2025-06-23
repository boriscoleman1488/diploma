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
  BookOpen,
  Plus,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Search,
  Eye,
  Share2,
  Bookmark
} from 'lucide-react'

export default function CategoryDetailsPage() {
  const params = useParams()
  const categoryId = params.categoryId as string
  const [dishes, setDishes] = useState<any[]>([])
  const [isLoadingDishes, setIsLoadingDishes] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  
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
            description: 'Традиційний український борщ з м\'ясом та сметаною. Рецепт передається з покоління в покоління.',
            main_image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
            servings: 4,
            cooking_time: 90,
            difficulty: 'Середній',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Марія Петренко', profile_tag: 'maria_cook' },
            ratings: [{ rating_type: 1 }, { rating_type: 1 }, { rating_type: 1 }],
            comments_count: 5
          },
          {
            id: '2',
            title: 'Вареники з картоплею',
            description: 'Домашні вареники з картопляною начинкою та смаженою цибулею',
            main_image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
            servings: 6,
            cooking_time: 60,
            difficulty: 'Легкий',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Олександр Коваль', profile_tag: 'alex_chef' },
            ratings: [{ rating_type: 1 }, { rating_type: 1 }],
            comments_count: 3
          },
          {
            id: '3',
            title: 'Котлети по-київськи',
            description: 'Соковиті котлети з курячого філе з вершковим маслом всередині',
            main_image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
            servings: 4,
            cooking_time: 45,
            difficulty: 'Складний',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Ірина Шевченко', profile_tag: 'irina_kitchen' },
            ratings: [{ rating_type: 1 }, { rating_type: 1 }, { rating_type: 1 }, { rating_type: 1 }],
            comments_count: 8
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
          <div className="relative">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl animate-pulse"></div>
            <div className="relative p-8 bg-white rounded-full shadow-2xl">
              <LoadingSpinner size="lg" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Завантаження категорії</h3>
          <p className="text-gray-600 text-lg">Підготовуємо інформацію про категорію...</p>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Error Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-red-600"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-pink-600/20 to-red-600/20"></div>
          
          <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="text-9xl mb-4 animate-bounce">❌</div>
                <div className="absolute inset-0 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">
                Категорію не знайдено
              </h1>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Запитувана категорія не існує або була видалена. Поверніться до списку категорій.
              </p>
              <Link href="/categories">
                <Button 
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
                  leftIcon={<ArrowLeft className="w-6 h-6" />}
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

  const filteredDishes = dishes.filter(dish =>
    dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Category Header */}
      <div className="relative overflow-hidden">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-pink-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          {/* Enhanced Breadcrumb */}
          <div className="flex items-center space-x-3 text-white/80 mb-10">
            <Link href="/categories" className="hover:text-white transition-colors duration-200 flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Категорії
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-white font-medium bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              {selectedCategory.name}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Enhanced Category Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl animate-pulse"></div>
              <div className="relative p-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30">
                <ChefHat className="w-20 h-20 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <div className="flex-1">
              {/* Enhanced Category Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                {selectedCategory.name}
                <div className="inline-block ml-4 animate-bounce">
                  <Sparkles className="w-10 h-10 text-yellow-300 drop-shadow-lg" />
                </div>
              </h1>
              
              {/* Enhanced Description */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
                {selectedCategory.description || 'Колекція найкращих рецептів у цій категорії'}
              </p>
              
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                  <div className="flex items-center">
                    <Hash className="w-6 h-6 mr-3 text-white" />
                    <div>
                      <div className="text-2xl font-bold text-white">{dishes.length}</div>
                      <div className="text-white/80 text-sm">рецептів</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-white" />
                    <div>
                      <div className="text-lg font-semibold text-white">Створено</div>
                      <div className="text-white/80 text-sm">{formatDate(selectedCategory.created_at)}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-white" />
                    <div>
                      <div className="text-lg font-semibold text-white">Оновлено</div>
                      <div className="text-white/80 text-sm">{formatRelativeTime(selectedCategory.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Enhanced Search and Filters */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Пошук рецептів у категорії..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      leftIcon={<Grid3X3 className="w-4 h-4" />}
                      className="rounded-lg"
                    >
                      Сітка
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      leftIcon={<List className="w-4 h-4" />}
                      className="rounded-lg"
                    >
                      Список
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Filter className="w-4 h-4" />}
                    className="rounded-xl"
                  >
                    Фільтри
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<SortAsc className="w-4 h-4" />}
                    className="rounded-xl"
                  >
                    Сортування
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Dishes Section */}
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center text-2xl font-bold">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl mr-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                Рецепти в категорії
                <span className="ml-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {filteredDishes.length} рецептів
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {isLoadingDishes ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative p-6 bg-white rounded-full shadow-xl">
                        <LoadingSpinner size="lg" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Завантаження рецептів</h3>
                    <p className="text-gray-600 text-lg">Підготовуємо найкращі рецепти для вас...</p>
                  </div>
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="text-9xl mb-4 animate-bounce">🍽️</div>
                    <div className="absolute inset-0 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {searchQuery ? 'Рецепти не знайдено' : 'Немає рецептів'}
                  </h3>
                  <p className="text-gray-600 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
                    {searchQuery 
                      ? `Не знайдено рецептів за запитом "${searchQuery}". Спробуйте інший пошук.`
                      : 'У цій категорії поки що немає рецептів. Станьте першим, хто поділиться своїм кулінарним шедевром!'
                    }
                  </p>
                  {!searchQuery && (
                    <Button 
                      size="lg" 
                      leftIcon={<Plus className="w-6 h-6" />}
                      className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Створити перший рецепт
                    </Button>
                  )}
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'space-y-6'
                }>
                  {filteredDishes.map((dish) => (
                    <Card key={dish.id} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden group">
                      <div className="relative overflow-hidden">
                        <img
                          src={dish.main_image_url}
                          alt={dish.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Heart className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Bookmark className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Share2 className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {dish.difficulty}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                          {dish.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span className="truncate">{dish.profiles.full_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 mr-1" />
                            <span>{dish.servings} порцій</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{dish.cooking_time} хв</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1 text-red-500" />
                              <span>{dish.ratings.length}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1 text-blue-500" />
                              <span>{dish.comments_count}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1 text-green-500" />
                              <span>124</span>
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            className="shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
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

          {/* Enhanced Category Stats */}
          {filteredDishes.length > 0 && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-2xl font-bold">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl mr-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  Статистика категорії
                  <Star className="w-6 h-6 ml-3 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl w-fit mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {filteredDishes.length}
                    </div>
                    <div className="text-gray-600 font-medium">Рецептів</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl w-fit mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {filteredDishes.reduce((sum, dish) => sum + dish.ratings.length, 0)}
                    </div>
                    <div className="text-gray-600 font-medium">Лайків</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl w-fit mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {filteredDishes.reduce((sum, dish) => sum + dish.comments_count, 0)}
                    </div>
                    <div className="text-gray-600 font-medium">Коментарів</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl w-fit mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(filteredDishes.reduce((sum, dish) => sum + (dish.cooking_time || 0), 0) / filteredDishes.length) || 0}
                    </div>
                    <div className="text-gray-600 font-medium">Хв середньо</div>
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