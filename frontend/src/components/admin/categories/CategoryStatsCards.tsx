import { Card, CardContent } from '@/components/ui/Card'
import { 
  Grid3X3, 
  ChefHat, 
  AlertTriangle 
} from 'lucide-react'

interface CategoryStatsCardsProps {
  totalCategories: number
  totalDishes: number
  emptyCategories: number
}

export function CategoryStatsCards({ 
  totalCategories, 
  totalDishes, 
  emptyCategories 
}: CategoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Grid3X3 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всього категорій</p>
              <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всього страв</p>
              <p className="text-2xl font-bold text-gray-900">{totalDishes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Порожні категорії</p>
              <p className="text-2xl font-bold text-gray-900">{emptyCategories}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}