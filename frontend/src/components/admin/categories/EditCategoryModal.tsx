import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { Category } from '@/types/category'
import { X, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface EditCategoryModalProps {
  isOpen: boolean
  category: Category | null
  onClose: () => void
  onSuccess: () => void
}

export function EditCategoryModal({ isOpen, category, onClose, onSuccess }: EditCategoryModalProps) {
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