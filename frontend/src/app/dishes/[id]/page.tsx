'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CommentSection } from '@/components/dishes/CommentSection'
import { RatingSection } from '@/components/dishes/RatingSection'
import { AddToCollectionButton } from '@/components/dishes/AddToCollectionButton'
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
  Zap,
  Share2,
  BookOpen,
  CheckCircle,
  AlertTriangle
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
  dietLabels?: string[]
  healthLabels?: string[]
  cautions?: string[]
}

export default function DishDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [dish, setDish] = useState<Dish | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const isNotFoundError = (errorMessage: string): boolean => {
    const notFoundIndicators = [
      'not found',
      'unable to fetch dish',
      'страву не знайдено',
      'dish not found'
    ]
    
    return notFoundIndicators.some(indicator => 
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )
  }

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
      const errorMessage = error instanceof Error ? error.message : 'Не вдалося завантажити страву'
      
      // Use console.warn for expected "not found" scenarios instead of console.error
      if (isNotFoundError(errorMessage)) {
        console.warn('Failed to fetch dish:', errorMessage)
      } else {
        console.error('Failed to fetch dish:', error)
      }
      
      toast.error(errorMessage)
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

  const handleShare = async () => {
    const shareData = {
      title: dish?.title || 'Страва',
      text: dish?.description || 'Перегляньте цю страву',
      url: window.location.href
    }

    // Check if Web Share API is supported and can share this data
    if (navigator.share) {
      // Check if navigator.canShare is available and if the data can be shared
      if (navigator.canShare && !navigator.canShare(shareData)) {
        // If canShare returns false, fall back to clipboard
        fallbackToClipboard()
        return
      }

      try {
        await navigator.share(shareData)
      } catch (error) {
        // If sharing fails (permission denied, user cancelled, etc.), fall back to clipboard
        fallbackToClipboard()
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      fallbackToClipboard()
    }
  }

  const fallbackToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Посилання скопійовано в буфер обміну'))
      .catch(() => toast.error('Не вдалося скопіювати посилання'))
  }

  // Функції для перекладу та кольорів характеристик дієти
  const getDietLabelColor = (label: string) => {
    const colors: { [key: string]: string } = {
      'Balanced': 'bg-green-100 text-green-800',
      'High-Fiber': 'bg-blue-100 text-blue-800',
      'High-Protein': 'bg-purple-100 text-purple-800',
      'Low-Carb': 'bg-orange-100 text-orange-800',
      'Low-Fat': 'bg-yellow-100 text-yellow-800',
      'Low-Sodium': 'bg-indigo-100 text-indigo-800'
    }
    return colors[label] || 'bg-gray-100 text-gray-800'
  }

  const getHealthLabelColor = (label: string) => {
    const healthColors: { [key: string]: string } = {
      'Vegan': 'bg-green-100 text-green-800',
      'Vegetarian': 'bg-green-100 text-green-800',
      'Gluten-Free': 'bg-blue-100 text-blue-800',
      'Dairy-Free': 'bg-purple-100 text-purple-800',
      'Sugar-Conscious': 'bg-orange-100 text-orange-800',
      'Keto-Friendly': 'bg-red-100 text-red-800'
    }
    return healthColors[label] || 'bg-gray-100 text-gray-800'
  }

  const translateDietLabel = (label: string): string => {
    const dietTranslations: { [key: string]: string } = {
      'Balanced': 'Збалансована',
      'High-Fiber': 'Високий вміст клітковини',
      'High-Protein': 'Високий вміст білка',
      'Low-Carb': 'Низький вміст вуглеводів',
      'Low-Fat': 'Низький вміст жирів',
      'Low-Sodium': 'Низький вміст натрію',
      'Keto-Friendly': 'Кето-дружня',
      'Paleo': 'Палео',
      'Vegan': 'Веганська',
      'Vegetarian': 'Вегетаріанська',
      'Mediterranean': 'Середземноморська'
    }
    return dietTranslations[label] || label
  }

  const translateHealthLabel = (label: string): string => {
    const healthTranslations: { [key: string]: string } = {
      'Vegan': 'Веганський',
      'Vegetarian': 'Вегетаріанський',
      'Paleo': 'Палео',
      'Dairy-Free': 'Без молочних продуктів',
      'Gluten-Free': 'Без глютену',
      'Wheat-Free': 'Без пшениці',
      'Egg-Free': 'Без яєць',
      'Milk-Free': 'Без молока',
      'Peanut-Free': 'Без арахісу',
      'Tree-Nut-Free': 'Без горіхів',
      'Soy-Free': 'Без сої',
      'Fish-Free': 'Без риби',
      'Shellfish-Free': 'Без морепродуктів',
      'Alcohol-Free': 'Без алкоголю',
      'Low Sugar': 'Низький вміст цукру',
      'Keto-Friendly': 'Кето-дружній',
      'Kosher': 'Кошерний',
      'Low Sodium': 'Низький вміст натрію'
    }
    return healthTranslations[label] || label
  }

  const translateCaution = (caution: string): string => {
    const cautionTranslations: { [key: string]: string } = {
      'Gluten': 'Містить глютен',
      'Wheat': 'Містить пшеницю',
      'Eggs': 'Містить яйця',
      'Milk': 'Містить молоко',
      'Peanuts': 'Містить арахіс',
      'Tree-Nuts': 'Містить горіхи',
      'Soy': 'Містить сою',
      'Fish': 'Містить рибу',
      'Shellfish': 'Містить морепродукти',
      'Celery': 'Містить селеру',
      'Mustard': 'Містить гірчицю',
      'Sesame': 'Містить кунжут',
      'Sulfites': 'Містить сульфіти'
    }
    return cautionTranslations[caution] || caution
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
                      {cat.dish_categories?.name || cat.name}
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

                  {/* Diet and Health Labels */}
                  {(nutritionData.dietLabels && nutritionData.dietLabels.length > 0) || 
                   (nutritionData.healthLabels && nutritionData.healthLabels.length > 0) ? (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Характеристики дієти</h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionData.dietLabels?.map((label, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDietLabelColor(label)}`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            {translateDietLabel(label)}
                          </span>
                        ))}
                        {nutritionData.healthLabels?.slice(0, 5).map((label, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthLabelColor(label)}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {translateHealthLabel(label)}
                          </span>
                        ))}
                        {nutritionData.healthLabels && nutritionData.healthLabels.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{nutritionData.healthLabels.length - 5} ще
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Cautions */}
                  {nutritionData.cautions && nutritionData.cautions.length > 0 && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Попередження</h4>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {nutritionData.cautions.map((caution, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                              >
                                {translateCaution(caution)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

          {/* Collection Section */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Колекції
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddToCollectionButton dishId={id} />
              </CardContent>
            </Card>
          )}

          {/* Share Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Поділитися
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={handleShare}
              >
                Поділитися стравою
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}