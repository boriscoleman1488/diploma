import { Button } from '@/components/ui/Button'
import { BookOpen, FolderPlus } from 'lucide-react'

interface EmptyCollectionsStateProps {
  searchQuery: string
  onCreateClick: () => void
}

export function EmptyCollectionsState({ searchQuery, onCreateClick }: EmptyCollectionsStateProps) {
  return (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery ? 'Колекції не знайдено' : 'У вас ще немає колекцій'}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery 
          ? 'Спробуйте змінити пошуковий запит' 
          : 'Створіть свою першу колекцію страв'
        }
      </p>
      {!searchQuery && (
        <Button
          onClick={onCreateClick}
          leftIcon={<FolderPlus className="w-4 h-4" />}
        >
          Створити колекцію
        </Button>
      )}
    </div>
  )
}