'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Dish } from '@/types/dish'
import { ArrowLeft, Save, ChefHat } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface EditDishPageProps {
  params: { id: string }
}

export default function EditDishPage({ params }: EditDishPageProps) {
  const { id } = params
  const router = useRouter()
  const { user } = useAuthStore()
  const [dish, setDish] = useState<Dish | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: 1,
    main_image_url: ''
  })

  useEffect(() => {
    fetchDish()
  }, [id])

  const fetchDish = async () => {
    try {
      const response = await apiClient.get(`/dishes/${id}`)
      if (response.success && response.dish) {
        const dishData = response.dish
        setDish(dishData)
        setFormData({
          title: dishData.title || '',
          description: dishData.description || '',
          servings: dishData.servings || 1,
          main_image_url: dishData.main_image_url || ''
        })
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Назва страви є обов\'язковою')
      return
    }

    setIsSaving(true)
    try {
      // Використовуємо PUT замість PATCH
      const response = await apiClient.put(`/dishes/${id}`, formData)
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
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Назва страви *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введіть назву страви"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Опис
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Розкажіть про вашу страву..."
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Servings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кількість порцій
              </label>
              <Input
                type="number"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                min={1}
                max={20}
              />
            </div>

            {/* Main Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL головного зображення
              </label>
              <Input
                value={formData.main_image_url}
                onChange={(e) => handleInputChange('main_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.main_image_url && (
                <div className="mt-2">
                  <img
                    src={formData.main_image_url}
                    alt="Попередній перегляд"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              >
                {isSaving ? 'Збереження...' : 'Зберегти зміни'}
              </Button>
              <Link href="/profile/dishes">
                <Button variant="outline">
                  Скасувати
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}