import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Collection } from '@/types/collection'
import { X, Edit } from 'lucide-react'

interface EditCollectionModalProps {
  collection: Collection | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (name: string, description?: string) => Promise<boolean>
}

export function EditCollectionModal({ 
  collection, 
  isOpen, 
  onClose, 
  onUpdate 
}: EditCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isOpen && collection) {
      setName(collection.name)
      setDescription(collection.description || '')
    }
  }, [isOpen, collection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setIsUpdating(true)
    try {
      const success = await onUpdate(name, description)
      if (success) {
        onClose()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      onClose()
    }
  }

  if (!isOpen || !collection) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Редагувати колекцію
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Назва колекції *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введіть назву колекції"
              disabled={isUpdating}
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
              placeholder="Введіть опис колекції"
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