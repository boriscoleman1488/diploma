'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { 
  Grid3X3, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  ChefHat
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  dishes_count?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/categories')
      if (response.success && response.categories) {
        setCategories(response.categories)
        setFilteredCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити категорії')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  return (
    <div className="space-y-6">
      {/* Header */}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Категорії страв
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Переглядайте та керуйте категоріями страв
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук категорій..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'Категорії не знайдено' : 'Немає категорій'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2 text-primary-600" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.description && (
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <ChefHat className="w-4 h-4 mr-1" />
                      {category.dishes_count || 0} страв
                    </div>
                    <div>
                      Створено {formatDate(category.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}