import { Button } from '@/components/ui/Button'
import { ChefHat } from 'lucide-react'
import Link from 'next/link'

interface EmptyCollectionStateProps {
  searchQuery: string
}

export function EmptyCollectionState({ searchQuery }: EmptyCollectionStateProps) {
  return (
    <div className="text-center py-12">
      <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery ? 'Страви не знайдено' : 'У цій колекції ще немає страв'}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery 
          ? 'Спробуйте змінити пошуковий запит' 
          : 'Додайте страви до цієї колекції'
        }
      </p>
      {!searchQuery && (
        <Link href="/dishes">
          <Button leftIcon={<ChefHat className="w-4 h-4" />}>
            Переглянути страви
          </Button>
        </Link>
      )}
    </div>
  )
}