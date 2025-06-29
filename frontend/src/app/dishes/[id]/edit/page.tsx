'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IngredientSearch } from '@/components/dishes/IngredientSearch'
import { ImageUpload } from '@/components/dishes/ImageUpload'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Dish, DishIngredient, DishStep } from '@/types/dish'
import { 
  ArrowLeft, 
  Save, 
  ChefHat, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Users, 
  Camera,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface EditDishPageProps {
  params: { id: string }
}

interface Category {
  id: string
  name: string
}

const ingredientSchema = z.object({
  name: z.string().min(1, 'Назва інгредієнта обов\'язкова'),
  amount: z.number().min(0, 'Кількість повинна бути позитивною'),
  unit: z.string().min(1, 'Одиниця виміру обов\'язкова'),
  edamam_food_id: z.string().optional()
})

const stepSchema = z.object({
  description: z.string().min(1, 'Опис кроку обов\'язковий'),
  duration_minutes: z.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal(''))
})

const dishSchema = z.object({
  title: z.string().min(1, 'Назва страви обов\'язкова').max(200, 'Назва занадто довга'),
  description: z.string().min(1, 'Опис страви обов\'язковий').max(1000, 'Опис занадто довгий'),
  servings: z.number().min(1, 'Мінімум 1 порція').max(50, 'Максимум 50 порцій'),
  category_ids: z.array(z.string()).optional(),
  ingredients: z.array(ingredientSchema).min(1, 'Додайте хоча б один інгредієнт'),
  steps: z.array(stepSchema).min(1, 'Додайте хоча б один крок приготування'),
  main_image_url: z.string().url().optional().or(z.literal(''))
})

type DishFormData = z.infer<typeof dishSchema>

export default function EditDishPage({ params }: EditDishPageProps) {
  const { id } = params
  const router = useRouter()
  const { user } = useAuthStore()
  const [dish, setDish] = useState<Dish | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showIngredientSearch, setShowIngredientSearch] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState('')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      title: '',
      description: '',
      servings: 4,
      category_ids: [],
      ingredients: [],
      steps: [],
      main_image_url: ''
    }
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  })

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps'
  })

  const watchedSteps = watch('steps')
  const totalCookingTime = watchedSteps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0

  useEffect(() => {
    fetchDish()
    fetchCategories()
  }, [id])

  const fetchDish = async () => {
    try {
      // Use the new edit endpoint that allows users to fetch their own dishes regardless of status
      const response = await apiClient.get(`/dishes/${id}/edit`)
      if (response.success && response.dish) {
        const dishData = response.dish
        console.log('Завантажені дані страви:', dishData)
        console.log('URL головного зображення:', dishData.main_image_url)
        
        setDish(dishData)
        setMainImageUrl(dishData.main_image_url || '')
        
        // Получаем категории блюда
        const dishCategories = dishData.categories?.map(cat => {
          // Безпечний доступ до властивостей
          if (cat && cat.dish_categories && cat.dish_categories.id) {
            return cat.dish_categories.id
          }
          // Якщо структура інша, спробуємо альтернативні варіанти
          if (cat && typeof cat === 'object' && 'id' in cat) {
            return cat.id
          }
          return null
        }).filter(Boolean) || []
        setSelectedCategories(dishCategories)
        
        // Заполняем форму данными
        reset({
          title: dishData.title || '',
          description: dishData.description || '',
          servings: dishData.servings || 4,
          category_ids: dishCategories,
          ingredients: dishData.ingredients || [],
          steps: dishData.steps || [],
          main_image_url: dishData.main_image_url || ''
        })
        
        console.log('mainImageUrl встановлено:', dishData.main_image_url || '')
      } else {
        toast.error('Страву не знайдено')
        router.push('/profile/dishes')
      }
    } catch (error) {
      console.error('Failed to fetch dish:', error)
      toast.error('Не вдалося завантажити страву')
      router.push('/profile/dishes')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories')
      if (response.success) {
        setCategories(response.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newCategories)
    setValue('category_ids', newCategories)
  }

  const handleAddManualIngredient = () => {
    appendIngredient({ name: '', amount: 0, unit: 'г' })
  }

  const handleAddIngredientFromSearch = (ingredient: any) => {
    appendIngredient({
      name: ingredient.name,
      amount: ingredient.amount || 0,
      unit: ingredient.unit || 'г',
      edamam_food_id: ingredient.edamam_food_id
    })
  }

  const handleStepImageUploaded = (index: number, imageUrl: string) => {
    setValue(`steps.${index}.image_url`, imageUrl)
  }

  const handleStepImageRemoved = (index: number) => {
    setValue(`steps.${index}.image_url`, '')
  }

  const onSubmit = async (data: DishFormData) => {
    setIsSaving(true)
    try {
      const updateData = {
        ...data,
        main_image_url: mainImageUrl,
        category_ids: selectedCategories
      }
      
      const response = await apiClient.put(`/dishes/${id}`, updateData)
      if (response.success) {
        toast.success('Страву успішно оновлено')
        router.push('/profile/dishes')
      } else {
        toast.error(response.error || 'Не вдалося оновити страву')
      }
    } catch (error) {
      console.error('Failed to update dish:', error)
      toast.error('Не вдалося оновити страву')
    } finally {
      setIsSaving(false)
    }
  }

  const isApproved = dish?.status === 'approved'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження страви...</p>
        </div>
      </div>
    )
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Страву не знайдено</h2>
          <p className="text-gray-600 mb-6">Можливо, страву було видалено або у вас немає прав для її редагування</p>
          <Link href="/profile/dishes">
            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Повернутися до моїх страв
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile/dishes">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Повернутися до моїх страв
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Редагувати страву</h1>
          <p className="text-gray-600 mt-2">Внесіть зміни до вашої страви</p>
          
          {!isApproved && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Страва не опублікована
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ви можете редагувати страву, але вона не буде доступна для публічного перегляду, поки не буде схвалена модератором.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Основна інформація</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва страви *
                </label>
                <Input
                  {...register('title')}
                  placeholder="Введіть назву страви"
                  error={errors.title?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис *
                </label>
                <Textarea
                  {...register('description')}
                  placeholder="Опишіть вашу страву, її особливості та смак"
                  rows={4}
                  error={errors.description?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Кількість порцій *
                  </label>
                  <Input
                    type="number"
                    {...register('servings', { valueAsNumber: true })}
                    min={1}
                    max={50}
                    error={errors.servings?.message}
                  />
                </div>

                {totalCookingTime > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Загальний час приготування
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          {totalCookingTime} хвилин
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Головне зображення страви
                </label>
                <ImageUpload
                  onImageUploaded={setMainImageUrl}
                  currentImageUrl={mainImageUrl}
                  onImageRemoved={() => setMainImageUrl('')}
                  type="dish"
                  placeholder="Завантажити головне зображення страви"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Категорії</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Інгредієнти *
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIngredientSearch(!showIngredientSearch)}
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    {showIngredientSearch ? 'Приховати пошук' : 'Пошук інгредієнтів'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddManualIngredient}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Додати вручну
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showIngredientSearch && (
                <IngredientSearch
                  onAddIngredient={handleAddIngredientFromSearch}
                  className="mb-6"
                />
              )}

              {ingredientFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Назва інгредієнта
                    </label>
                    <Input
                      {...register(`ingredients.${index}.name`)}
                      placeholder="Назва інгредієнта"
                      error={errors.ingredients?.[index]?.name?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Кількість
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      {...register(`ingredients.${index}.amount`, { valueAsNumber: true })}
                      placeholder="0"
                      error={errors.ingredients?.[index]?.amount?.message}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Одиниця
                      </label>
                      <select
                        {...register(`ingredients.${index}.unit`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="г">г</option>
                        <option value="кг">кг</option>
                        <option value="мл">мл</option>
                        <option value="л">л</option>
                        <option value="шт">шт</option>
                        <option value="ст.л.">ст.л.</option>
                        <option value="ч.л.">ч.л.</option>
                        <option value="склянка">склянка</option>
                        <option value="пучок">пучок</option>
                      </select>
                    </div>
                    {ingredientFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {ingredientFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Ще немає інгредієнтів</p>
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowIngredientSearch(true)}
                      leftIcon={<Search className="w-4 h-4" />}
                    >
                      Знайти інгредієнти
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddManualIngredient}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Додати вручну
                    </Button>
                  </div>
                </div>
              )}

              {errors.ingredients && (
                <p className="text-sm text-red-600">{errors.ingredients.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Кроки приготування *
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendStep({ description: '', duration_minutes: 0, image_url: '' })}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Додати крок
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stepFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <span className="bg-primary-100 text-primary-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                        {index + 1}
                      </span>
                      Крок {index + 1}
                    </h4>
                    {stepFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(index)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Видалити
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Опис кроку *
                        </label>
                        <Textarea
                          {...register(`steps.${index}.description`)}
                          placeholder="Детально опишіть що потрібно зробити на цьому кроці"
                          rows={4}
                          error={errors.steps?.[index]?.description?.message}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Час виконання (хвилини)
                        </label>
                        <Input
                          type="number"
                          {...register(`steps.${index}.duration_minutes`, { valueAsNumber: true })}
                          placeholder="0"
                          min={0}
                          error={errors.steps?.[index]?.duration_minutes?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Зображення кроку (необов'язково)
                      </label>
                      <ImageUpload
                        onImageUploaded={(imageUrl) => handleStepImageUploaded(index, imageUrl)}
                        currentImageUrl={watch(`steps.${index}.image_url`) || ''}
                        onImageRemoved={() => handleStepImageRemoved(index)}
                        type="step"
                        placeholder="Завантажити зображення для цього кроку"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {stepFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Ще немає кроків приготування</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendStep({ description: '', duration_minutes: 0, image_url: '' })}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Додати перший крок
                  </Button>
                </div>
              )}
              
              {errors.steps && (
                <p className="text-sm text-red-600">{errors.steps.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/profile/dishes">
              <Button type="button" variant="outline">
                Скасувати
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSaving || dish.status !== 'approved'}
              title={dish.status !== 'approved' ? 'Редагування доступне тільки для схвалених страв' : ''}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Збереження...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Зберегти зміни
                </>
              )}
            </Button>
          </div>
          
          {dish.status !== 'approved' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Редагування недоступне
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Редагування страви доступне тільки після її схвалення модератором. Поточний статус: {dish.status === 'pending' ? 'на розгляді' : dish.status === 'rejected' ? 'відхилено' : 'чернетка'}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}