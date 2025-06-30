import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface CategoryHeaderProps {
  onCreateClick: () => void
}

export function CategoryHeader({ onCreateClick }: CategoryHeaderProps) {
  return (
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
        onClick={onCreateClick}
      >
        Створити категорію
      </Button>
    </div>
  )
}