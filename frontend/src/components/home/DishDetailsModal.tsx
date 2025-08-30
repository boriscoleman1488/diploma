import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Dish } from '@/types/dish'
import { 
  Heart, 
  Clock,
  Users,
  MessageCircle,
  Grid3X3,
  Eye,
  X,
  LogIn,
  UserPlus,
  Activity,
  Zap,
  Target,
  CheckCircle,
  AlertCircle
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

export function DishDetailsModal({ dish, isOpen, onClose }: DishDetailsModalProps) {
  const { isAuthenticated } = useAuthStore()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false)

  if (!isOpen || !dish) return null

  const likesCount = dish.ratings?.filter(r => r.rating === 1 || r.rating === "1").length || 0
  const totalCookingTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0

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
                    <Grid3X3 className="w-3 h-3 mr-1" />
                    {cat.dish_categories?.name || cat.name}
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