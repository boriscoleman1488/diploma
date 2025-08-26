import { Card, CardContent } from '@/components/ui/Card'
import { 
  ChefHat, 
  Users, 
  Activity,
  Eye
} from 'lucide-react'

interface StatsSectionProps {
  totalDishes: number
  approvedDishes: number
  totalChefs: number
  dishesWithNutrition: number
}

export function StatsSection({ 
  totalDishes, 
  approvedDishes, 
  totalChefs
}: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
            <ChefHat className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalDishes}</h3>
          <p className="text-gray-600">Всього страв</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{approvedDishes}</h3>
          <p className="text-gray-600">Опубліковано</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalChefs}</h3>
          <p className="text-gray-600">Активних кулінарів</p>
        </CardContent>
      </Card>

    </div>
  )
}