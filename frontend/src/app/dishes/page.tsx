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
  SlidersHorizontal,
  Grid3X3,
  Eye,
  X,
  LogIn,
  UserPlus,
  Image as ImageIcon,
  Activity,
  Zap,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
    fiber?: { quantity: number; unit: string }
    sugar?: { quantity: number; unit: string }
    sodium?: { quantity: number; unit: string }
  }
  totalWeight?: number
  dietLabels?: string[]
  healthLabels?: string[]
  cautions?: string[]
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
      .map(categoryRelation => categoryRelation.dish_categories)
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
                    <Grid3X3 className="w-3 h-3 mr-1" />
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

                  {/* Загальна інформація */}
                  {nutritionData && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Загальна інформація</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Всього калорій:</span>
                          <span className="font-medium ml-2">{nutritionData.calories} ккал</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Порцій:</span>
                          <span className="font-medium ml-2">{dish.servings}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Загальна вага:</span>
                          <span className="font-medium ml-2">{nutritionData.totalWeight || 'Н/Д'} г</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Характеристики дієти */}
                  {nutritionData && (nutritionData.dietLabels?.length > 0 || nutritionData.healthLabels?.length > 0) && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Характеристики дієти</h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionData.dietLabels?.map((label, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDietLabelColor(label)}`}
                          >
                            <Target className="w-3 h-3 mr-1" />
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
                  )}

                  {/* Попередження */}
                  {nutritionData && nutritionData.cautions?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Попередження</h4>
                          <div className="mt-1 flex flex-wrap gap-1">
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

                  {/* Детальний склад (на порцію) */}
                  {nutritionData && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Детальний склад (на порцію)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Клітковина:</span>
                            <span className="font-medium">
                              {nutritionData.macrosPerServing?.fiber?.quantity || nutritionData.macros?.fiber?.quantity || 0} г
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Цукор:</span>
                            <span className="font-medium">
                              {nutritionData.macrosPerServing?.sugar?.quantity || nutritionData.macros?.sugar?.quantity || 0} г
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Натрій:</span>
                            <span className="font-medium">
                              {nutritionData.macrosPerServing?.sodium?.quantity || nutritionData.macros?.sodium?.quantity || 0} мг
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Калорії з жирів:</span>
                            <span className="font-medium">
                              {Math.round((nutritionData.macrosPerServing?.fat?.quantity || nutritionData.macros?.fat?.quantity || 0) * 9)} ккал
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Калорії з білків:</span>
                            <span className="font-medium">
                              {Math.round((nutritionData.macrosPerServing?.protein?.quantity || nutritionData.macros?.protein?.quantity || 0) * 4)} ккал
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-600">Калорії з вуглеводів:</span>
                            <span className="font-medium">
                              {Math.round((nutritionData.macrosPerServing?.carbs?.quantity || nutritionData.macros?.carbs?.quantity || 0) * 4)} ккал
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Загальна інформація */}
                {nutritionData && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Загальна інформація</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Всього калорій:</span>
                        <span className="font-medium ml-2">{nutritionData.calories} ккал</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Порцій:</span>
                        <span className="font-medium ml-2">{dish.servings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Загальна вага:</span>
                        <span className="font-medium ml-2">{nutritionData.totalWeight || 'Н/Д'} г</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Характеристики дієти */}
                {nutritionData && (nutritionData.dietLabels?.length > 0 || nutritionData.healthLabels?.length > 0) && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Характеристики дієти</h4>
                    <div className="flex flex-wrap gap-2">
                      {nutritionData.dietLabels?.map((label, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDietLabelColor(label)}`}
                        >
                          <Target className="w-3 h-3 mr-1" />
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
                )}

                {/* Попередження */}
                {nutritionData && nutritionData.cautions?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Попередження</h4>
                        <div className="mt-1 flex flex-wrap gap-1">
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

                {/* Детальний склад (на порцію) */}
                {nutritionData && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Детальний склад (на порцію)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Клітковина:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.fiber?.quantity || nutritionData.macros?.fiber?.quantity || 0} г
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Цукор:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.sugar?.quantity || nutritionData.macros?.sugar?.quantity || 0} г
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Натрій:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.sodium?.quantity || nutritionData.macros?.sodium?.quantity || 0} мг
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з жирів:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.fat?.quantity || nutritionData.macros?.fat?.quantity || 0) * 9)} ккал
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з білків:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.protein?.quantity || nutritionData.macros?.protein?.quantity || 0) * 4)} ккал
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з вуглеводів:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.carbs?.quantity || nutritionData.macros?.carbs?.quantity || 0) * 4)} ккал
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Загальна інформація */}
                {nutritionData && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Загальна інформація</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Всього калорій:</span>
                        <span className="font-medium ml-2">{nutritionData.calories} ккал</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Порцій:</span>
                        <span className="font-medium ml-2">{dish.servings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Загальна вага:</span>
                        <span className="font-medium ml-2">{nutritionData.totalWeight || 'Н/Д'} г</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Характеристики дієти */}
                {nutritionData && (nutritionData.dietLabels?.length > 0 || nutritionData.healthLabels?.length > 0) && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Характеристики дієти</h4>
                    <div className="flex flex-wrap gap-2">
                      {nutritionData.dietLabels?.map((label, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDietLabelColor(label)}`}
                        >
                          <Target className="w-3 h-3 mr-1" />
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
                )}

                {/* Попередження */}
                {nutritionData && nutritionData.cautions?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Попередження</h4>
                        <div className="mt-1 flex flex-wrap gap-1">
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

                {/* Детальний склад (на порцію) */}
                {nutritionData && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Детальний склад (на порцію)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Клітковина:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.fiber?.quantity || nutritionData.macros?.fiber?.quantity || 0} г
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Цукор:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.sugar?.quantity || nutritionData.macros?.sugar?.quantity || 0} г
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Натрій:</span>
                          <span className="font-medium">
                            {nutritionData.macrosPerServing?.sodium?.quantity || nutritionData.macros?.sodium?.quantity || 0} мг
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з жирів:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.fat?.quantity || nutritionData.macros?.fat?.quantity || 0) * 9)} ккал
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з білків:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.protein?.quantity || nutritionData.macros?.protein?.quantity || 0) * 4)} ккал
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Калорії з вуглеводів:</span>
                          <span className="font-medium">
                            {Math.round((nutritionData.macrosPerServing?.carbs?.quantity || nutritionData.macros?.carbs?.quantity || 0) * 4)} ккал
                          </span>
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

// Функції для перекладу характеристик дієти
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
    'Pescatarian': 'Пескетаріанська',
    'Mediterranean': 'Середземноморська',
    'DASH': 'DASH дієта',
    'Low-FODMAP': 'Низький FODMAP'
  }
  return dietTranslations[label] || label
}

// Функції для перекладу характеристик здоров'я
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
    'Pork-Free': 'Без свинини',
    'Red-Meat-Free': 'Без червоного м\'яса',
    'Alcohol-Free': 'Без алкоголю',
    'No oil added': 'Без додавання олії',
    'Low Sugar': 'Низький вміст цукру',
    'Keto-Friendly': 'Кето-дружній',
    'Kidney-Friendly': 'Дружній до нирок',
    'Kosher': 'Кошерний',
    'Low Potassium': 'Низький вміст калію',
    'Low Sodium': 'Низький вміст натрію',
    'FODMAP-Free': 'Без FODMAP',
    'Immuno-Supportive': 'Підтримує імунітет'
  }
  return healthTranslations[label] || label
}

// Функції для перекладу попереджень
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
    'Crustaceans': 'Містить ракоподібних',
    'Mollusks': 'Містить молюсків',
    'Celery': 'Містить селеру',
    'Mustard': 'Містить гірчицю',
    'Sesame': 'Містить кунжут',
    'Lupine': 'Містить люпин',
    'Sulfites': 'Містить сульфіти'
  }
  return cautionTranslations[caution] || caution
}

// Функції для кольорів тегів
const getDietLabelColor = (label: string) => {
  const colors: { [key: string]: string } = {
    'Balanced': 'bg-green-100 text-green-800',
    'High-Fiber': 'bg-blue-100 text-blue-800',
    'High-Protein': 'bg-purple-100 text-purple-800',
    'Low-Carb': 'bg-orange-100 text-orange-800',
    'Low-Fat': 'bg-yellow-100 text-yellow-800',
    'Low-Sodium': 'bg-indigo-100 text-indigo-800',
    'Keto-Friendly': 'bg-red-100 text-red-800',
    'Vegan': 'bg-green-100 text-green-800',
    'Vegetarian': 'bg-green-100 text-green-800'
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
    'Keto-Friendly': 'bg-red-100 text-red-800',
    'Paleo': 'bg-yellow-100 text-yellow-800',
    'Low-Sodium': 'bg-indigo-100 text-indigo-800'
  }
  return healthColors[label] || 'bg-gray-100 text-gray-800'
}
// Функції для перекладу характеристик дієти
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
    'Pescatarian': 'Пескетаріанська',
    'Mediterranean': 'Середземноморська',
    'DASH': 'DASH дієта',
    'Low-FODMAP': 'Низький FODMAP'
  }
  return dietTranslations[label] || label
}

// Функції для перекладу характеристик здоров'я
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
    'Pork-Free': 'Без свинини',
    'Red-Meat-Free': 'Без червоного м\'яса',
    'Alcohol-Free': 'Без алкоголю',
    'No oil added': 'Без додавання олії',
    'Low Sugar': 'Низький вміст цукру',
    'Keto-Friendly': 'Кето-дружній',
    'Kidney-Friendly': 'Дружній до нирок',
    'Kosher': 'Кошерний',
    'Low Potassium': 'Низький вміст калію',
    'Low Sodium': 'Низький вміст натрію',
    'FODMAP-Free': 'Без FODMAP',
    'Immuno-Supportive': 'Підтримує імунітет'
  }
  return healthTranslations[label] || label
}

// Функції для перекладу попереджень
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
    'Crustaceans': 'Містить ракоподібних',
    'Mollusks': 'Містить молюсків',
    'Celery': 'Містить селеру',
    'Mustard': 'Містить гірчицю',
    'Sesame': 'Містить кунжут',
    'Lupine': 'Містить люпин',
    'Sulfites': 'Містить сульфіти'
  }
  return cautionTranslations[caution] || caution
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [cookingTime, setCookingTime] = useState('')
  const [servingsCount, setServingsCount] = useState('')
  const [hasNutrition, setHasNutrition] = useState(false)
  const [ratingFilter, setRatingFilter] = useState('')
  const [stepsFilter, setStepsFilter] = useState('')
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
        setDishes(response.dishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories =  async () => {
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

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('newest')
    setCookingTime('')
    setServingsCount('')
    setHasNutrition(false)
    setRatingFilter('')
    setStepsFilter('')
  }
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchDishes()
  }, [selectedCategory])

  // Apply all filters
  useEffect(() => {
    let filtered = [...dishes]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.profile_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by rating/likes
    if (ratingFilter) {
      filtered = filtered.filter(dish => {
        const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
        
        if (ratingFilter === 'no-likes') return likesCount === 0
        if (ratingFilter === 'few-likes') return likesCount >= 1 && likesCount <= 5
        if (ratingFilter === 'popular') return likesCount >= 6 && likesCount <= 15
        if (ratingFilter === 'very-popular') return likesCount > 15
        
        return true
      })
    }

    // Filter by number of steps
    if (stepsFilter) {
      filtered = filtered.filter(dish => {
        const stepsCount = dish.steps?.length || 0
        
        if (stepsFilter === 'simple') return stepsCount >= 1 && stepsCount <= 3
        if (stepsFilter === 'medium') return stepsCount >= 4 && stepsCount <= 7
        if (stepsFilter === 'complex') return stepsCount >= 8
        
        return true
      })
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
  }, [dishes, searchQuery, sortBy, cookingTime, servingsCount, hasNutrition, ratingFilter, stepsFilter])

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
    if (!dish.steps || !Array.isArray(dish.steps)) return null
    const total = dish.steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0)
    return total > 0 ? total : null
  }

  const getDishCategories = (dish: Dish) => {
    if (!dish.categories || !Array.isArray(dish.categories)) return []
    
    return dish.categories
      .map(categoryRelation => categoryRelation.dish_categories)
      .filter(Boolean)
  }

  const hasFilters = !!(searchQuery || selectedCategory || sortBy !== 'newest' || 
                      cookingTime || servingsCount || hasNutrition || ratingFilter || stepsFilter)
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
                Відкрийте для себе дивовижні страви з аналізом калорій від нашої спільноти
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Пошук страв за назвою, описом, автором або @тегом..."
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
              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                    <option value="rating">За рейтингом</option>
                    <option value="popular">За популярністю</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    За рейтингом
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Будь-який рейтинг</option>
                    <option value="no-likes">Без лайків</option>
                    <option value="few-likes">1-5 лайків</option>
                    <option value="popular">6-15 лайків</option>
                    <option value="very-popular">15+ лайків</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    За складністю
                  </label>
                  <select
                    value={stepsFilter}
                    onChange={(e) => setStepsFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Будь-яка складність</option>
                    <option value="simple">Прості (1-3 кроки)</option>
                    <option value="medium">Середні (4-7 кроків)</option>
                    <option value="complex">Складні (8+ кроків)</option>
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
                    З аналізом калорій
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasNutrition}
                      onChange={(e) => setHasNutrition(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">Тільки з поживною цінністю</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Скинути фільтри
                  </Button>
                </div>
              </div>
            )}
          
            {/* Active filters display */}
            {hasFilters && (
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
                {ratingFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    Рейтинг: {
                      ratingFilter === 'no-likes' ? 'Без лайків' :
                      ratingFilter === 'few-likes' ? '1-5 лайків' :
                      ratingFilter === 'popular' ? '6-15 лайків' :
                      ratingFilter === 'very-popular' ? '15+ лайків' : ''
                    }
                    <button
                      onClick={() => setRatingFilter('')}
                      className="ml-1 text-pink-600 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {stepsFilter && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Складність: {
                      stepsFilter === 'simple' ? 'Прості' :
                      stepsFilter === 'medium' ? 'Середні' :
                      stepsFilter === 'complex' ? 'Складні' : ''
                    }
                    <button
                      onClick={() => setStepsFilter('')}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {sortBy !== 'newest' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Сортування: {
                      sortBy === 'oldest' ? 'Найстаріші' :
                      sortBy === 'popular' ? 'За популярністю' :
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
            {hasFilters ? 'Страви не знайдено' : 'Немає страв'}
          </h3>
          <p className="text-gray-600 mb-6">
            {hasFilters 
              ? 'Спробуйте змінити критерії пошуку або очистити фільтри'
              : 'Станьте першим, хто додасть страву!'
            }
          </p>
          {hasFilters ? (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={resetFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Очистити фільтри
              </Button>
            </div>
          ) : (
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
              {hasFilters ? 'Результати пошуку' : 'Всі страви'}
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
              <Card key={dish.id} className="hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
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
                      >
                        Переглянути
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        </>
      )}

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