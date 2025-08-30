import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { DishCard } from '@/components/home/DishCard'
import { EmptyState } from '@/components/home/EmptyState'
import { Dish } from '@/types/dish'

interface DishesGridProps {
  dishes: Dish[]
  isLoading: boolean
  hasFilters: boolean
  onResetFilters: () => void
  isAuthenticated: boolean
  onViewDetails: (dishId: string) => void
}

export function DishesGrid({ 
  dishes, 
  isLoading, 
  hasFilters, 
  onResetFilters, 
  isAuthenticated,
  onViewDetails
}: DishesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження страв...</p>
        </div>
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <EmptyState 
        hasFilters={hasFilters}
        onResetFilters={onResetFilters}
        isAuthenticated={isAuthenticated}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => (
        <DishCard 
          key={dish.id} 
          dish={dish} 
          onViewDetails={() => onViewDetails(dish.id)}
        />
      ))}
    </div>
  )
}