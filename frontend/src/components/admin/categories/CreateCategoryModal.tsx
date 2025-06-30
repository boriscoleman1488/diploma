import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateCategoryModal({ isOpen, onClose, onSuccess }: CreateCategoryModalProps) {
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