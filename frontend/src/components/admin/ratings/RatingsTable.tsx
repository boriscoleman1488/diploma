import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils'
import { 
  Heart, 
  Eye, 
  Trash2,
  Calendar
} from 'lucide-react'

interface Rating {
  id: string
  rating: number
  created_at: string
  updated_at: string
  dishes: {
    id: string
    title: string
    status: string
  }
  profiles: {
    id: string
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
}

interface RatingsTableProps {
  ratings: Rating[]
  isLoading: boolean
  onViewRating: (ratingId: string) => void
  onDeleteRating: (ratingId: string) => Promise<boolean>
  isUpdating: boolean
}

export function RatingsTable({ 
  ratings, 
  isLoading, 
  onViewRating, 
  onDeleteRating,
  isUpdating
}: RatingsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Рейтинги не знайдено</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Список рейтингів
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Користувач
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Страва
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ratings.map((rating) => (
                <tr key={rating.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Heart className={`w-5 h-5 text-red-500 ${rating.rating === 1 || rating.rating === "1" ? 'fill-current' : ''}`} />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {rating.rating === 1 || rating.rating === "1" ? 'Лайк' : 'Без рейтингу'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={rating.profiles.avatar_url}
                        name={rating.profiles.full_name || rating.profiles.email}
                        size="sm"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {rating.profiles.full_name || 'Невідомо'}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{rating.profiles.profile_tag || 'user'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rating.dishes.title}</div>
                    <div className="text-xs text-gray-500">
                      {rating.dishes.status === 'approved' ? 'Схвалено' : 
                       rating.dishes.status === 'pending' ? 'На розгляді' : 'Відхилено'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatRelativeTime(rating.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRating(rating.id)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Переглянути
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteRating(rating.id)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        disabled={isUpdating}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Видалити
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