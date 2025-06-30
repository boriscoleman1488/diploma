import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { Category } from '@/types/category'
import { 
  Grid3X3, 
  Edit, 
  Trash2,
  ChefHat
} from 'lucide-react'

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  isDeleting: string | null
  onEdit: (category: Category) => void
  onDelete: (categoryId: string, categoryName: string) => void
}

export function CategoryTable({ 
  categories, 
  isLoading, 
  isDeleting, 
  onEdit, 
  onDelete 
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Категорії не знайдено</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Список категорій</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Назва</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Опис</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Страв</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Створено</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Дії</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Grid3X3 className="w-5 h-5 mr-3 text-primary-600" />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {category.description || '—'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <ChefHat className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-900">{category.dishes_count || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {formatDate(category.created_at)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="w-4 h-4" />}
                        onClick={() => onEdit(category)}
                      >
                        Редагувати
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => onDelete(category.id, category.name)}
                        disabled={isDeleting === category.id}
                      >
                        {isDeleting === category.id ? 'Видалення...' : 'Видалити'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}