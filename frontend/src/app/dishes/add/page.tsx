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
import { apiClient } from '@/lib/api'
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Upload,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

const ingredientSchema = z.object({
  name: z.string().min(1, 'Назва інгредієнта обов\'язкова'),
  amount: z.number().min(0, 'Кількість повинна бути позитивною'),
  unit: z.string().min(1, 'Одиниця виміру обов\'язкова')
})

const stepSchema = z.object({
  description: z.string().min(1, 'Опис кроку обов\'язковий'),
  duration_minutes: z.number().min(0).optional()
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

export default function AddDishPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      title: '',
      description: '',
      servings: 1,
      category_ids: [],
      ingredients: [{ name: '', amount: 0, unit: '' }],
      steps: [{ description: '', duration_minutes: 0 }],
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

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories')
      if (response.success && response.categories) {
        setCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Не вдалося завантажити категорії')
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newSelected)
    setValue('category_ids', newSelected)
  }

  const onSubmit = async (data: DishFormData) => {
    setIsLoading(true)
    try {
      const dishData = {
        ...data,
        category_ids: selectedCategories,
        main_image_url: data.main_image_url || undefined
      }

      const response = await apiClient.post('/dishes', dishData)
      
      if (response.success) {
        toast.success('Страву успішно створено!')
        router.push('/profile')
      } else {
        toast.error(response.message || 'Не вдалося створити страву')
      }
    } catch (error) {
      console.error('Failed to create dish:', error)
      toast.error(error instanceof Error ? error.message : 'Помилка при створенні страви')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <ChefHat className="w-8 h-8 mr-3" />
                  Додати нову страву
                </h1>
                <p className="text-primary-100 mt-1">
                  Створіть свій унікальний рецепт
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                placeholder="Опишіть вашу страву"
                rows={4}
                error={errors.description?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Головне зображення (URL)
                </label>
                <Input
                  {...register('main_image_url')}
                  placeholder="https://example.com/image.jpg"
                  error={errors.main_image_url?.message}
                />
              </div>
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
                  className="flex items-center space-x-2 cursor-pointer"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendIngredient({ name: '', amount: 0, unit: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Додати інгредієнт
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва
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
                    <Input
                      {...register(`ingredients.${index}.unit`)}
                      placeholder="г, мл, шт"
                      error={errors.ingredients?.[index]?.unit?.message}
                    />
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
                onClick={() => appendStep({ description: '', duration_minutes: 0 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Додати крок
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Крок {index + 1}</h4>
                  {stepFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Опис кроку
                    </label>
                    <Textarea
                      {...register(`steps.${index}.description`)}
                      placeholder="Опишіть що потрібно зробити"
                      rows={3}
                      error={errors.steps?.[index]?.description?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Час (хвилини)
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
              </div>
            ))}
            {errors.steps && (
              <p className="text-sm text-red-600">{errors.steps.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/profile">
            <Button type="button" variant="outline">
              Скасувати
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Створення...
              </>
            ) : (
              'Створити страву'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}