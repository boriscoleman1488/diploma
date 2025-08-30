import { Button } from '@/components/ui/Button'
import { Plus, ChefHat } from 'lucide-react'
import Link from 'next/link'

interface DishesHeaderProps {
  totalDishes: number
  filteredCount: number
  hasFilters: boolean
}

export function DishesHeader({ totalDishes, filteredCount, hasFilters }: DishesHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ChefHat className="w-8 h-8 mr-3" />
              Всі страви
            </h1>
            <p className="text-primary-100 mt-1">
              Відкрийте для себе дивовижні страви від нашої спільноти кулінарів
            </p>
          </div>
          <Link href="/dishes/add">
            <Button
              variant="secondary"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              Додати страву
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Всього страв: <span className="font-medium text-gray-900">{totalDishes}</span>
          </div>
          <div>
            {hasFilters ? (
              <>
                Знайдено: <span className="font-medium text-gray-900">{filteredCount}</span> страв
              </>
            ) : (
              <>
                Показано: <span className="font-medium text-gray-900">{filteredCount}</span> страв
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}