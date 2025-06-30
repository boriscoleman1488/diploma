'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
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
  Star,
  TrendingUp,
  Calendar,
  ArrowRight,
  LogIn,
  UserPlus,
  Image as ImageIcon,
  Activity,
  Zap,
  X,
  SlidersHorizontal,
  ChevronsUpDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
  ingredients?: Array<{
    name: string
    amount: number
    unit: string
  }>
  steps?: Array<{
    description: string
    duration_minutes?: number
    image_url?: string
  }>
}

interface Category {
  id: string
  name: string
  description?: string
}

interface NutritionData {
  calories: number
  caloriesPerServing: number
  macros: {
    protein: { quantity: number; unit: string }
    fat: { quantity: number; unit: string }
    carbs: { quantity: number; unit: string }
  }
  macrosPerServing?: {
    protein: { quantity: number; unit: string }
    fat: { quantity: number; unit: string }
    carbs: { quantity: number; unit: string }
  }
}

interface FiltersProps {
  categories: Category[]
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  cookingTime: string
  setCookingTime: (value: string) => void
  servingsCount: string
  setServingsCount: (value: string) => void
  hasNutrition: boolean
  setHasNutrition: (value: boolean) => void
  onReset: () => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  cookingTime,
  setCookingTime,
  servingsCount,
  setServingsCount,
  hasNutrition,
  setHasNutrition,
  onReset,
  searchQuery,
  setSearchQuery
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="search-input"
                placeholder="Пошук страв за назвою, описом або автором..."
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {showFilters ? 'Приховати фільтри' : 'Додаткові фільтри'}
            </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сортувати за
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Найновіші</option>
                  <option value="oldest">Найстаріші</option>
                  <option value="popular">Найпопулярніші</option>
                  <option value="rating">За рейтингом</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Час приготування
                </label>
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-який час</option>
                  <option value="quick">Швидко (до 30 хв)</option>
                  <option value="medium">Середній (30-60 хв)</option>
                  <option value="long">Довго (більше 60 хв)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Кількість порцій
                </label>
                <select
                  value={servingsCount}
                  onChange={(e) => setServingsCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-яка кількість</option>
                  <option value="1-2">1-2 порції</option>
                  <option value="3-4">3-4 порції</option>
                  <option value="5+">5+ порцій</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Додаткові опції
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasNutrition}
                      onChange={(e) => setHasNutrition(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">З аналізом калорій</span>
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Скинути фільтри
                </Button>
              </div>
            </div>
          )}
          
          {/* Active filters display */}
          {(searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition) && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-sm text-gray-500">Активні фільтри:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Пошук: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Категорія: {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Сортування: {
                    sortBy === 'oldest' ? 'Найстаріші' :
                    sortBy === 'popular' ? 'Найпопулярніші' :
                    sortBy === 'rating' ? 'За рейтингом' : ''
                  }
                  <button
                    onClick={() => setSortBy('newest')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {cookingTime && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Час: {
                    cookingTime === 'quick' ? 'До 30 хв' :
                    cookingTime === 'medium' ? '30-60 хв' :
                    cookingTime === 'long' ? 'Більше 60 хв' : ''
                  }
                  <button
                    onClick={() => setCookingTime('')}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {servingsCount && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Порції: {
                    servingsCount === '1-2' ? '1-2 порції' :
                    servingsCount === '3-4' ? '3-4 порції' :
                    servingsCount === '5+' ? '5+ порцій' : ''
                  }
                  <button
                    onClick={() => setServingsCount('')}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {hasNutrition && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  З аналізом калорій
                  <button
                    onClick={() => setHasNutrition(false)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DishDetailsModalProps {
  dish: Dish | null
  isOpen: boolean
  onClose: () => void
}

function DishDetailsModal({ dish, isOpen, onClose }: DishDetailsModalProps) {
  const { isAuthenticated } = useAuthStore()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false)

  if (!isOpen || !dish) return null

  const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
  const totalCookingTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0

  const handleAuthAction = (action: string) => {
    toast.error(`Щоб ${action}, потрібно зареєструватися або увійти в систему`, {
      duration: 5000,
    })
  }

  const analyzeNutrition = async () => {
    if (!dish.ingredients || dish.ingredients.length === 0) {
      toast.error('Немає інгредієнтів для аналізу')
      return
    }

    setIsAnalyzingNutrition(true)
    try {
      const response = await apiClient.post('/edamam/analyze-nutrition', {
        ingredients: dish.ingredients,
        servings: dish.servings
      })

      if (response.success && response.nutrition) {
        setNutritionData(response.nutrition)
        toast.success('Поживну цінність розраховано!')
      } else {
        toast.error('Не вдалося розрахувати поживну цінність')
      }
    } catch (error) {
      console.error('Nutrition analysis error:', error)
      toast.error('Помилка аналізу поживності')
    } finally {
      setIsAnalyzingNutrition(false)
    }
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

  const dishCategories = getDishCategories(dish)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header Image */}
          {dish.main_image_url && (
            <div className="h-64 bg-gray-200 overflow-hidden rounded-t-xl">
              <img
                src={dish.main_image_url}
                alt={dish.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dish Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{dish.title}</h2>
            <p className="text-gray-600 mb-4">{dish.description}</p>
            
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {dish.servings} порцій
              </div>
              {totalCookingTime > 0 && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {totalCookingTime} хв
                </div>
              )}
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {likesCount} лайків
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {dish.comments_count || 0} коментарів
              </div>
            </div>
          </div>

          {/* Categories */}
          {dishCategories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Категорії</h4>
              <div className="flex flex-wrap gap-2">
                {dishCategories.map((cat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Avatar
              src={dish.profiles?.avatar_url}
              name={dish.profiles?.full_name || dish.profiles?.email}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">
                {dish.profiles?.full_name || 'Невідомий автор'}
              </p>
              <p className="text-sm text-gray-500">
                @{dish.profiles?.profile_tag || 'user'}
              </p>
              <p className="text-xs text-gray-400">
                Опубліковано {formatRelativeTime(dish.created_at)}
              </p>
            </div>
          </div>

          {/* Nutrition Analysis */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Поживна цінність
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeNutrition}
                    disabled={isAnalyzingNutrition}
                    leftIcon={isAnalyzingNutrition ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" />}
                  >
                    {isAnalyzingNutrition ? 'Аналізуємо...' : 'Розрахувати'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nutritionData ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary-900">
                        {nutritionData.caloriesPerServing}
                      </div>
                      <div className="text-xs text-primary-700">ккал/порція</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-900">
                        {nutritionData.macrosPerServing?.protein.quantity || nutritionData.macros.protein.quantity}
                      </div>
                      <div className="text-xs text-green-700">г білків</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-900">
                        {nutritionData.macrosPerServing?.carbs.quantity || nutritionData.macros.carbs.quantity}
                      </div>
                      <div className="text-xs text-blue-700">г вуглеводів</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-yellow-900">
                        {nutritionData.macrosPerServing?.fat.quantity || nutritionData.macros.fat.quantity}
                      </div>
                      <div className="text-xs text-yellow-700">г жирів</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      Натисніть "Розрахувати", щоб дізнатися калорійність та поживну цінність
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Інгредієнти</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dish.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900 font-medium">{ingredient.name}</span>
                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {dish.steps && dish.steps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Кроки приготування</h4>
              <div className="space-y-6">
                {dish.steps.map((step, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-3">{step.description}</p>
                      
                      {/* Step Image */}
                      {step.image_url && (
                        <div className="mb-3">
                          <img
                            src={step.image_url}
                            alt={`Крок ${index + 1}`}
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      
                      {step.duration_minutes && step.duration_minutes > 0 && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.duration_minutes} хвилин
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auth Required Message */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <LogIn className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">
                    Приєднайтеся до нашої спільноти!
                  </h5>
                  <p className="text-sm text-blue-700 mb-3">
                    Щоб ставити лайки стравам та залишати коментарі, потрібно зареєструватися або увійти в систему.
                  </p>
                  <div className="flex space-x-3">
                    <Link href="/auth/login">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<LogIn className="w-4 h-4" />}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Увійти
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        size="sm"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Зареєструватися
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Link href={`/dishes/${dish.id}`} className="flex-1">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Переглянути повну сторінку
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const { isAuthenticated } = useAuthStore()
  
  // Additional filter states
  const [sortBy, setSortBy] = useState('newest')
  const [cookingTime, setCookingTime] = useState('')
  const [servingsCount, setServingsCount] = useState('')
  const [hasNutrition, setHasNutrition] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchDishes = async () => {
    setIsLoading(true)
    try {
      let url = '/dishes'
      const params = new URLSearchParams()
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await apiClient.get(url)
      if (response.success && response.dishes) {
        // Фільтруємо тільки схвалені страви
        const approvedDishes = response.dishes.filter((dish: Dish) => dish.status === 'approved')
        setDishes(approvedDishes)
        setFilteredDishes(approvedDishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error('Не вдалося завантажити страви')
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

  const handleViewDish = async (dishId: string) => {
    try {
      const response = await apiClient.get(`/dishes/${dishId}`)
      if (response.success && response.dish) {
        setSelectedDish(response.dish)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch dish details:', error)
      toast.error('Не вдалося завантажити деталі страви')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchDishes()
  }, [selectedCategory])

  useEffect(() => {
    let filtered = dishes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by cooking time
    if (cookingTime) {
      filtered = filtered.filter(dish => {
        const totalTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0
        
        if (cookingTime === 'quick') return totalTime > 0 && totalTime <= 30
        if (cookingTime === 'medium') return totalTime > 30 && totalTime <= 60
        if (cookingTime === 'long') return totalTime > 60
        
        return true
      })
    }

    // Filter by servings count
    if (servingsCount) {
      filtered = filtered.filter(dish => {
        const count = dish.servings || 0
        
        if (servingsCount === '1-2') return count >= 1 && count <= 2
        if (servingsCount === '3-4') return count >= 3 && count <= 4
        if (servingsCount === '5+') return count >= 5
        
        return true
      })
    }

    // Filter by nutrition info availability
    if (hasNutrition) {
      filtered = filtered.filter(dish => 
        dish.ingredients && dish.ingredients.length > 0
      )
    }

    // Sort dishes
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        if (sortBy === 'popular') {
          const aLikes = a.ratings?.filter(r => r.rating === 1).length || 0
          const bLikes = b.ratings?.filter(r => r.rating === 1).length || 0
          return bLikes - aLikes
        }
        if (sortBy === 'rating') {
          const aLikes = a.ratings?.filter(r => r.rating === 1).length || 0
          const bLikes = b.ratings?.filter(r => r.rating === 1).length || 0
          const aTotal = a.ratings?.length || 1
          const bTotal = b.ratings?.length || 1
          return (bLikes / bTotal) - (aLikes / aTotal)
        }
        return 0
      })
    }

    setFilteredDishes(filtered)
  }, [searchQuery, dishes, sortBy, cookingTime, servingsCount, hasNutrition])

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('newest')
    setCookingTime('')
    setServingsCount('')
    setHasNutrition(false)
  }

  const getTotalCookingTime = (dish: Dish) => {
    if (!dish.steps || !Array.isArray(dish.steps)) return null
    const total = dish.steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
    return total > 0 ? total : null
  }

  const getDishCategories = (dish: Dish) => {
    if (!dish.categories || !Array.isArray(dish.categories)) return []
    return dish.categories.filter(cat => cat?.dish_categories?.name)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Відкрийте світ смаків
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Знайдіть ідеальні страви від нашої спільноти кулінарів. 
              Готуйте, діліться та насолоджуйтеся!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dishes/add">
                  <Button 
                    size="lg"
                    variant="secondary"
                    leftIcon={<Plus className="w-5 h-5" />}
                    className="bg-white text-primary-600 hover:bg-primary-50"
                  >
                    Додати свою страву
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button 
                    size="lg"
                    variant="secondary"
                    leftIcon={<ChefHat className="w-5 h-5" />}
                    className="bg-white text-primary-600 hover:bg-primary-50"
                  >
                    Приєднатися
                  </Button>
                </Link>
              )}
              <Button 
                size="lg"
                variant="outline"
                leftIcon={<Search className="w-5 h-5" />}
                className="border-white text-white hover:bg-white hover:text-primary-600"
                onClick={() => document.getElementById('search-input')?.focus()}
              >
                Знайти страви
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                <ChefHat className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{dishes.length}</h3>
              <p className="text-gray-600">Схвалених страв</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Set(dishes.map(d => d.user_id)).size}
              </h3>
              <p className="text-gray-600">Активних кулінарів</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {dishes.filter(d => d.ingredients && d.ingredients.length > 0).length}
              </h3>
              <p className="text-gray-600">Страв з аналізом калорій</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Filters 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          cookingTime={cookingTime}
          setCookingTime={setCookingTime}
          servingsCount={servingsCount}
          setServingsCount={setServingsCount}
          hasNutrition={hasNutrition}
          setHasNutrition={setHasNutrition}
          onReset={resetFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dishes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Завантаження страв...</p>
            </div>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition ? 'Страви не знайдено' : 'Поки що немає страв'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition
                ? 'Спробуйте змінити критерії пошуку'
                : 'Станьте першим, хто поділиться своєю стравою!'
              }
            </p>
            {(searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition) ? (
              <Button 
                variant="outline"
                onClick={resetFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Скинути всі фільтри
              </Button>
            ) : isAuthenticated && (
              <Link href="/dishes/add">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Додати першу страву
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition ? 'Результати пошуку' : 'Популярні страви'}
              </h2>
              <p className="text-gray-600">
                Знайдено {filteredDishes.length} {filteredDishes.length === 1 ? 'страва' : 'страв'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => {
                const cookingTime = getTotalCookingTime(dish)
                const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
                const dishCategories = getDishCategories(dish)
                const hasIngredients = dish.ingredients && dish.ingredients.length > 0

                return (
                  <Card key={dish.id} className="hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
                    {/* Image */}
                    <div 
                      className="aspect-video bg-gray-200 overflow-hidden relative"
                      onClick={() => handleViewDish(dish.id)}
                    >
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
                      
                      {/* Nutrition Badge */}
                      {hasIngredients && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Activity className="w-3 h-3 mr-1" />
                            Аналіз калорій
                          </span>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            Переглянути
                          </Button>
                        </div>
                      </div>
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
                              {cat.dish_categories.name}
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
                        <Link href={`/dishes/${dish.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            rightIcon={<ArrowRight className="w-3 h-3" />}
                          >
                            Детальніше
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Load More Button (for future pagination) */}
            {filteredDishes.length >= 12 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<TrendingUp className="w-4 h-4" />}
                >
                  Завантажити більше страв
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dish Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDish(null)
        }}
      />
    </div>
  )
}