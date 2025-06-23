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
  ChefHat,
  AlertTriangle,
  X
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

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditCategoryModalProps {
  isOpen: boolean
  category: Category | null
  onClose: () => void
  onSuccess: () => void
}

function CreateCategoryModal({ isOpen, onClose, onSuccess }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Назва категорії є обов\'язковою')
      return
    }

    setIsCreating(true)
    try {
      const response = await apiClient.post('/admin/categories', {
        name: name.trim(),
        description: description.trim() || undefined
      })
      
      if (response.success) {
        toast.success('Категорію успішно створено')
        setName('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        toast.error(response.error || 'Не вдалося створити категорію')
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося створити категорію')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Створити нову категорію
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Назва категорії *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введіть назву категорії"
              disabled={isCreating}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Опис (необов'язково)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введіть опис категорії"
              disabled={isCreating}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
              leftIcon={isCreating ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />}
            >
              {isCreating ? 'Створення...' : 'Створити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditCategoryModal({ isOpen, category, onClose, onSuccess }: EditCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize form with category data when modal opens
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name)
      setDescription(category.description || '')
    }
  }, [isOpen, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Назва категорії є обов\'язковою')
      return
    }

    if (!category) return

    setIsUpdating(true)
    try {
      const response = await apiClient.put(`/admin/categories/${category.id}`, {
        name: name.trim(),
        description: description.trim() || undefined
      })
      
      if (response.success) {
        toast.success('Категорію успішно оновлено')
        onSuccess()
        onClose()
      } else {
        toast.error(response.error || 'Не вдалося оновити категорію')
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося оновити категорію')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Редагувати категорію
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isUpdating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Назва категорії *
            </label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введіть назву категорії"
              disabled={isUpdating}
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Опис (необов'язково)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введіть опис категорії"
              disabled={isUpdating}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !name.trim()}
              leftIcon={isUpdating ? <LoadingSpinner size="sm" /> : <Edit className="w-4 h-4" />}
            >
              {isUpdating ? 'Оновлення...' : 'Оновити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/categories')
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

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити категорію "${categoryName}"?`)) {
      return
    }

    setIsDeleting(categoryId)
    try {
      const response = await apiClient.delete(`/admin/categories/${categoryId}`)
      if (response.success) {
        toast.success('Категорію успішно видалено')
        fetchCategories()
      } else {
        toast.error(response.error || 'Не вдалося видалити категорію')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити категорію')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowEditModal(true)
  }

  const handleCreateSuccess = () => {
    fetchCategories()
  }

  const handleEditSuccess = () => {
    fetchCategories()
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingCategory(null)
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
            Управління категоріями
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Створюйте, редагуйте та видаляйте категорії страв
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Створити категорію
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Grid3X3 className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього категорій</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ChefHat className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всього страв</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Порожні категорії</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => (cat.dishes_count || 0) === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список категорій</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Категорії не знайдено' : 'Немає категорій'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Створити першу категорію
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Назва</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Опис</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Страв</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Створено</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Grid3X3 className="w-5 h-5 mr-3 text-primary-600" />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {category.description || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <ChefHat className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-900">{category.dishes_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEditCategory(category)}
                          >
                            Редагувати
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={isDeleting === category.id}
                          >
                            {isDeleting === category.id ? 'Видалення...' : 'Видалити'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        category={editingCategory}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}