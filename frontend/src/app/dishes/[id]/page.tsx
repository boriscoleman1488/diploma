'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CommentSection } from '@/components/dishes/CommentSection'
import { RatingSection } from '@/components/dishes/RatingSection'
import { apiClient } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Dish } from '@/types/dish'
import { 
  ChefHat, 
  Clock,
  Users,
  Heart,
  MessageCircle,
  Grid3X3,
  ArrowLeft,
  Activity,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

export default function DishDetailPage() {
  const { id } = useParams() as { id: string }
  const [dish, setDish] = useState<Dish | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const fetchDish = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/dishes/${id}`)
      if (response.success && response.dish) {
        setDish(response.dish)
      } else {
        toast.error('Страву не знайдено')
      }
    } catch (error) {
      console.error('Failed to fetch dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страву')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeNutrition = async () => {
    if (!dish?.ingredients || dish.ingredients.length === 0) {
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

  useEffect(() => {
    if (id) {
      fetchDish()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження страви...</p>
        </div>
      </div>
    )
  }

  if (!dish) {
    return (
      <div className="text-center py-12">
        <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Страву не знайдено</h2>
        <p className="text-gray-600 mb-6">
          Страва, яку ви шукаєте, не існує або була видалена
        </p>
        <Link href="/dishes">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Повернутися до списку страв
          </Button>
        </Link>
      </div>
    )
  }

  const totalCookingTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0
  const hasIngredients = dish.ingredients && dish.ingredients.length > 0

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
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dishes">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Повернутися до списку страв
          </Button>
        </Link>
      </div>

      {/* Dish Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Header Image */}
        {dish.main_image_url && (
          <div className="h-64 bg-gray-200 overflow-hidden">
            <img
              src={dish.main_image_url}
              alt={dish.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{dish.title}</h1>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          {dishCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Категорії
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dishCategories.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      <Grid3X3 className="w-3 h-3 mr-1" />
                      {cat.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nutrition Analysis */}
          {hasIngredients && (
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
          {hasIngredients && (
            <Card>
              <CardHeader>
                <CardTitle>Інгредієнти</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          {dish.steps && dish.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Кроки приготування</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection dishId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle>Автор</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
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
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Рейтинг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RatingSection dishId={id} />
            </CardContent>
          </Card>

          {/* Share Section (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Поділитися</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Facebook
                </Button>
                <Button variant="outline" className="flex-1">
                  Twitter
                </Button>
                <Button variant="outline" className="flex-1">
                  Telegram
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}