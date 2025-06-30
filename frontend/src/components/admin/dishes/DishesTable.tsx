import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Dish } from '@/types/dish'
import { 
  ChefHat, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Heart,
  MessageCircle,
  Users,
  Image as ImageIcon
} from 'lucide-react'

interface DishesTableProps {
  dishes: Dish[]
  isLoading: boolean
  onViewDish: (dishId: string) => void
}

export function DishesTable({ dishes, isLoading, onViewDish }: DishesTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Чернетка', color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { label: 'На розгляді', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Схвалено', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Відхилено', color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Страви не знайдено</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="w-5 h-5 mr-2" />
          Список страв
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Страва
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Створено
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dishes.map((dish) => {
                const likesCount = dish.ratings?.filter(r => r.rating === 1).length || 0
                
                return (
                  <tr key={dish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {dish.main_image_url ? (
                          <img
                            src={dish.main_image_url}
                            alt={dish.title}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {dish.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {dish.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          name={dish.profiles?.full_name || dish.profiles?.email}
                          size="sm"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {dish.profiles?.full_name || 'Невідомо'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{dish.profiles?.profile_tag || 'user'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(dish.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(dish.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {likesCount}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {dish.comments_count || 0}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {dish.servings}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDish(dish.id)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Переглянути
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}