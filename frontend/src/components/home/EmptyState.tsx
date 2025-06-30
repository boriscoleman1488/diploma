import { Button } from '@/components/ui/Button'
import { ChefHat, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  hasFilters: boolean
  onResetFilters: () => void
  isAuthenticated: boolean
}

export function EmptyState({ hasFilters, onResetFilters, isAuthenticated }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? 'Страви не знайдено' : 'Поки що немає страв'}
      </h3>
      <p className="text-gray-600 mb-6">
        {hasFilters
          ? 'Спробуйте змінити критерії пошуку'
          : 'Станьте першим, хто поділиться своєю стравою!'
        }
      </p>
      {hasFilters ? (
        <Button 
          variant="outline"
          onClick={onResetFilters}
          leftIcon={<X className="w-4 h-4" />}
        >
          Скинути всі фільтри
        </Button>
      ) : isAuthenticated && (
        <Link href="/dishes/add">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Додати першу страву
          </Button>
        </Link>
      )}
    </div>
  )
}