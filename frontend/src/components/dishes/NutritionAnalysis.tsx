'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { apiClient } from '@/lib/api'
import { 
  Activity, 
  Zap, 
  Target, 
  TrendingUp,
  Info,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Ingredient {
  name: string
  amount: number
  unit: string
}

interface NutritionData {
  calories: number
  totalWeight: number
  servings: number
  caloriesPerServing: number
  macros: {
    protein: { quantity: number; unit: string }
    fat: { quantity: number; unit: string }
    carbs: { quantity: number; unit: string }
    fiber: { quantity: number; unit: string }
    sugar: { quantity: number; unit: string }
    sodium: { quantity: number; unit: string }
  }
  macrosPerServing?: {
    protein: { quantity: number; unit: string }
    fat: { quantity: number; unit: string }
    carbs: { quantity: number; unit: string }
    fiber: { quantity: number; unit: string }
    sugar: { quantity: number; unit: string }
    sodium: { quantity: number; unit: string }
  }
  dietLabels: string[]
  healthLabels: string[]
  cautions: string[]
}

interface NutritionAnalysisProps {
  ingredients: Ingredient[]
  servings: number
  className?: string
  onNutritionCalculated?: (nutrition: NutritionData) => void
}

export function NutritionAnalysis({ 
  ingredients, 
  servings, 
  className = '',
  onNutritionCalculated 
}: NutritionAnalysisProps) {
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeNutrition = async () => {
    if (!ingredients || ingredients.length === 0) {
      toast.error('Додайте інгредієнти для аналізу поживності')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await apiClient.post('/edamam/analyze-nutrition', {
        ingredients,
        servings
      })

      if (response.success && response.nutrition) {
        setNutrition(response.nutrition)
        if (onNutritionCalculated) {
          onNutritionCalculated(response.nutrition)
        }
        toast.success('Поживну цінність розраховано успішно!')
      } else {
        setError(response.error || 'Не вдалося розрахувати поживну цінність')
        toast.error(response.message || 'Помилка аналізу поживності')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Помилка аналізу поживності'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearNutrition = () => {
    setNutrition(null)
    setError(null)
    setShowDetails(false)
  }

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

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Аналіз поживності
            </div>
            {nutrition && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearNutrition}
                leftIcon={<X className="w-4 h-4" />}
              >
                Очистити
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!nutrition && !error && (
            <div className="text-center py-6">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Розрахуйте калорійність та поживну цінність вашої страви
              </p>
              <Button
                onClick={analyzeNutrition}
                disabled={isAnalyzing || ingredients.length === 0}
                leftIcon={isAnalyzing ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" />}
              >
                {isAnalyzing ? 'Аналізуємо...' : 'Розрахувати поживність'}
              </Button>
              {ingredients.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Спочатку додайте інгредієнти
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Помилка аналізу поживності
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeNutrition}
                    className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                    leftIcon={<TrendingUp className="w-4 h-4" />}
                  >
                    Спробувати знову
                  </Button>
                </div>
              </div>
            </div>
          )}

          {nutrition && (
            <div className="space-y-4">
              {/* Main Nutrition Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary-900">
                    {nutrition.caloriesPerServing}
                  </div>
                  <div className="text-sm text-primary-700">ккал/порція</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {nutrition.macrosPerServing?.protein.quantity || nutrition.macros.protein.quantity}
                  </div>
                  <div className="text-sm text-green-700">г білків</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {nutrition.macrosPerServing?.carbs.quantity || nutrition.macros.carbs.quantity}
                  </div>
                  <div className="text-sm text-blue-700">г вуглеводів</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {nutrition.macrosPerServing?.fat.quantity || nutrition.macros.fat.quantity}
                  </div>
                  <div className="text-sm text-yellow-700">г жирів</div>
                </div>
              </div>

              {/* Total Recipe Stats */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Загальна інформація</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Всього калорій:</span>
                    <span className="font-medium ml-2">{nutrition.calories} ккал</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Порцій:</span>
                    <span className="font-medium ml-2">{nutrition.servings}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Загальна вага:</span>
                    <span className="font-medium ml-2">{nutrition.totalWeight} г</span>
                  </div>
                </div>
              </div>

              {/* Diet and Health Labels */}
              {(nutrition.dietLabels.length > 0 || nutrition.healthLabels.length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Характеристики дієти</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutrition.dietLabels.map((label, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDietLabelColor(label)}`}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {label}
                      </span>
                    ))}
                    {nutrition.healthLabels.slice(0, 5).map((label, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthLabelColor(label)}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {label}
                      </span>
                    ))}
                    {nutrition.healthLabels.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{nutrition.healthLabels.length - 5} ще
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Cautions */}
              {nutrition.cautions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Попередження</h4>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {nutrition.cautions.map((caution, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            {caution}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Nutrition Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  leftIcon={<Info className="w-4 h-4" />}
                >
                  {showDetails ? 'Приховати деталі' : 'Детальна інформація'}
                </Button>
              </div>

              {/* Detailed Nutrition Info */}
              {showDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Детальний склад (на порцію)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Клітковина:</span>
                        <span className="font-medium">
                          {nutrition.macrosPerServing?.fiber.quantity || nutrition.macros.fiber.quantity} {nutrition.macros.fiber.unit}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Цукор:</span>
                        <span className="font-medium">
                          {nutrition.macrosPerServing?.sugar.quantity || nutrition.macros.sugar.quantity} {nutrition.macros.sugar.unit}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Натрій:</span>
                        <span className="font-medium">
                          {nutrition.macrosPerServing?.sodium.quantity || nutrition.macros.sodium.quantity} {nutrition.macros.sodium.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Калорії з жирів:</span>
                        <span className="font-medium">
                          {Math.round((nutrition.macrosPerServing?.fat.quantity || nutrition.macros.fat.quantity) * 9)} ккал
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Калорії з білків:</span>
                        <span className="font-medium">
                          {Math.round((nutrition.macrosPerServing?.protein.quantity || nutrition.macros.protein.quantity) * 4)} ккал
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Калорії з вуглеводів:</span>
                        <span className="font-medium">
                          {Math.round((nutrition.macrosPerServing?.carbs.quantity || nutrition.macros.carbs.quantity) * 4)} ккал
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recalculate Button */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={analyzeNutrition}
                  disabled={isAnalyzing}
                  leftIcon={isAnalyzing ? <LoadingSpinner size="sm" /> : <TrendingUp className="w-4 h-4" />}
                >
                  {isAnalyzing ? 'Перерахунок...' : 'Перерахувати'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}