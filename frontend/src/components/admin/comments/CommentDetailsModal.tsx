import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  MessageCircle, 
  Trash2, 
  ChefHat, 
  Calendar, 
  X, 
  Check 
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  profiles: {
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
  dishes: {
    title: string
    status: string
  }
}

interface CommentDetailsModalProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onDelete: (commentId: string) => Promise<boolean>
  isUpdating: boolean
}

export function CommentDetailsModal({ 
  comment, 
  isOpen, 
  onClose, 
  onDelete, 
  isUpdating 
}: CommentDetailsModalProps) {
  if (!isOpen || !comment) return null

  const handleDelete = () => {
    if (confirm(`Ви впевнені, що хочете видалити цей коментар? Ця дія незворотна.`)) {
      onDelete(comment.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Деталі коментаря
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
          {/* Comment Content */}
          <Card>
            <CardHeader>
              <CardTitle>Зміст коментаря</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація про автора</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar
                  src={comment.profiles.avatar_url}
                  name={comment.profiles.full_name || comment.profiles.email}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.profiles.full_name || 'Невідомий автор'}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{comment.profiles.profile_tag || 'user'}
                  </p>
                  <p className="text-sm text-gray-500">{comment.profiles.email}</p>
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
                  <p className="font-medium text-gray-900">{comment.dishes.title}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comment.dishes.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : comment.dishes.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {comment.dishes.status === 'approved' ? 'Схвалено' : 
                     comment.dishes.status === 'pending' ? 'На розгляді' : 'Відхилено'}
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
                  <p className="text-sm text-gray-900">{formatDate(comment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Оновлено</p>
                  <p className="text-sm text-gray-900">{formatRelativeTime(comment.updated_at)}</p>
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
                  <p className="font-medium text-gray-900">Видалити коментар</p>
                  <p className="text-sm text-gray-500">
                    Ця дія незворотна. Коментар буде позначено як видалений.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isUpdating}
                    leftIcon={isUpdating ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Видалити
                  </Button>
                  {comment.is_deleted && (
                    <Button
                      variant="outline"
                      disabled={isUpdating}
                      leftIcon={<Check className="w-5 h-5" />}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Відновити
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}