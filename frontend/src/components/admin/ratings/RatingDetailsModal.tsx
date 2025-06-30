import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Heart, 
  Trash2,
  ChefHat,
  X
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

interface RatingDetailsModalProps {
  rating: Rating | null
  isOpen: boolean
  onClose: () => void
  onDelete: (ratingId: string) => Promise<boolean>
  isUpdating: boolean
}

export function RatingDetailsModal({ 
  rating, 
  isOpen, 
  onClose, 
  onDelete, 
  isUpdating 
}: RatingDetailsModalProps) {
  if (!isOpen || !rating) return null

  const handleDelete = () => {
    if (confirm(`Ви впевнені, що хочете видалити цей рейтинг? Ця дія незворотна.`)) {
      onDelete(rating.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Деталі рейтингу
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            Закрити
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rating Info */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація про рейтинг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className={`w-5 h-5 text-red-600 ${rating.rating === 1 || rating.rating === "1" ? 'fill-current' : ''}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {rating.rating === 1 || rating.rating === "1" ? 'Лайк' : 'Без рейтингу'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Поставлено {formatRelativeTime(rating.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація про користувача</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar
                  src={rating.profiles.avatar_url}
                  name={rating.profiles.full_name || rating.profiles.email}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {rating.profiles.full_name || 'Невідомий користувач'}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{rating.profiles.profile_tag || 'user'}
                  </p>
                  <p className="text-sm text-gray-500">{rating.profiles.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dish Info */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація про страву</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <ChefHat className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{rating.dishes.title}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rating.dishes.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : rating.dishes.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rating.dishes.status === 'approved' ? 'Схвалено' : 
                     rating.dishes.status === 'pending' ? 'На розгляді' : 'Відхилено'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Часові мітки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Створено</p>
                  <p className="text-sm text-gray-900">{formatDate(rating.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Оновлено</p>
                  <p className="text-sm text-gray-900">{formatRelativeTime(rating.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Небезпечна зона</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Видалити рейтинг</p>
                  <p className="text-sm text-gray-500">
                    Ця дія незворотна. Рейтинг буде повністю видалено.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isUpdating}
                  leftIcon={isUpdating ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {isUpdating ? 'Видалення...' : 'Видалити'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}