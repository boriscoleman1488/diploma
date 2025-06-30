import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Category } from '@/types/category'
import { Grid3X3, ChefHat } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface CategoryListProps {
  categories: Category[]
  isLoading: boolean
}

export function CategoryList({ categories, isLoading }: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="col-span-full flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Категорії не знайдено</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid3X3 className="w-5 h-5 mr-2 text-primary-600" />
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.description && (
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <ChefHat className="w-4 h-4 mr-1" />
                  {category.dishes_count || 0} страв
                </div>
                <div>
                  Створено {formatDate(category.created_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}