import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { X, Plus } from 'lucide-react'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description?: string) => Promise<boolean>
}

export function CreateCollectionModal({ isOpen, onClose, onCreate }: CreateCollectionModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setIsCreating(true)
    try {
      const success = await onCreate(name, description)
      if (success) {
        setName('')
        setDescription('')
        onClose()
      }
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
            Створити нову колекцію
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
              Назва колекції *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введіть назву колекції"
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
              placeholder="Введіть опис колекції"
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