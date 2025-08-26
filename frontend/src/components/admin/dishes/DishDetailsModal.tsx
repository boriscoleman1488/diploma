import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Dish } from '@/types/dish'
import { 
  ChefHat, 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Trash2,
  User,
  Calendar,
  Grid3X3,
  List,
  FileText,
  Image as ImageIcon,
  Info,
  AlertTriangle
} from 'lucide-react'

interface DishDetailsModalProps {
  dish: Dish | null
  isOpen: boolean
  onClose: () => void
  onModerate: (dishId: string, status: 'approved' | 'rejected', reason?: string) => void
  onDelete: (dishId: string) => void
  isUpdating: boolean
}

export function DishDetailsModal({ 
  dish,
  isOpen, 
  onClose, 
  onModerate, 
  onDelete, 
  isUpdating 
}: DishDetailsModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'steps' | 'categories'>('overview')

  if (!isOpen || !dish) return null

  const handleApprove = () => {
    onModerate(dish.id, 'approved')
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return
    }
    onModerate(dish.id, 'rejected', rejectionReason)
    setShowRejectForm(false)
    setRejectionReason('')
  }

  const handleDelete = () => {
    if (confirm(`Ви впевнені, що хочете видалити страву "${dish.title}"? Ця дія незворотна.`)) {
      onDelete(dish.id)
    }
  }

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

  const likesCount = dish.ratings?.filter(r => r.rating === 1 || r.rating === "1").length || 0
  const totalCookingTime = dish.steps?.reduce((total, step) => total + (step.duration_minutes || 0), 0) || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Модерація страви
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Закрити
          </Button>
        </div>

        <div className="p-6">
          {/* Dish Header with Image */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="md:w-1/3">
              {dish.main_image_url ? (
                <img
                  src={dish.main_image_url}
                  alt={dish.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="md:w-2/3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-semibold text-gray-900">{dish.title}</h3>
                {getStatusBadge(dish.status)}
              </div>
              
              <p className="text-gray-600 mb-4">{dish.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-700">{dish.servings} порцій</span>
                </div>
                
                {totalCookingTime > 0 && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{totalCookingTime} хв</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-700">{likesCount} лайків</span>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-700">{dish.comments_count || 0} коментарів</span>
                </div>
              </div>
              
              {/* Author Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  src={dish.profiles?.avatar_url}
                  name={dish.profiles?.full_name || dish.profiles?.email}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {dish.profiles?.full_name || 'Невідомий автор'}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{dish.profiles?.profile_tag || 'user'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {dish.profiles?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <Info className="w-4 h-4 inline mr-1" />
              Огляд
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'ingredients' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('ingredients')}
            >
              <List className="w-4 h-4 inline mr-1" />
              Інгредієнти
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'steps' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('steps')}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Кроки
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'categories' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              <Grid3X3 className="w-4 h-4 inline mr-1" />
              Категорії
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle>Часові мітки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Створено</p>
                        <p className="text-sm text-gray-900">{formatDate(dish.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Оновлено</p>
                        <p className="text-sm text-gray-900">{formatRelativeTime(dish.updated_at)}</p>
                      </div>
                      {dish.moderated_at && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Модеровано</p>
                          <p className="text-sm text-gray-900">{formatDate(dish.moderated_at)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Rejection Reason */}
                {dish.status === 'rejected' && dish.rejection_reason && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Причина відхилення</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900">{dish.rejection_reason}</p>
                    </CardContent>
                  </Card>
                )}

                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Інформація про автора</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID користувача</p>
                        <p className="text-sm text-gray-900 font-mono">{dish.user_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{dish.profiles?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Повне ім'я</p>
                        <p className="text-sm text-gray-900">{dish.profiles?.full_name || 'Не вказано'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Тег профілю</p>
                        <p className="text-sm text-gray-900">@{dish.profiles?.profile_tag || 'user'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <Card>
                <CardHeader>
                  <CardTitle>Інгредієнти</CardTitle>
                </CardHeader>
                <CardContent>
                  {dish.dish_ingredients && dish.dish_ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dish.dish_ingredients.map((ingredient, index) => (
                        <div key={ingredient.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900 font-medium">{ingredient.name}</span>
                          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                            {ingredient.amount} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Інгредієнти не вказані</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'steps' && (
              <Card>
                <CardHeader>
                  <CardTitle>Кроки приготування</CardTitle>
                </CardHeader>
                <CardContent>
                  {dish.dish_steps && dish.dish_steps.length > 0 ? (
                    <div className="space-y-6">
                      {dish.dish_steps.map((step, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </div>
                            <h4 className="font-medium text-gray-900">Крок {index + 1}</h4>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{step.description}</p>
                          
                          {step.image_url && (
                            <div className="mb-3">
                              <img
                                src={step.image_url}
                                alt={`Крок ${index + 1}`}
                                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                          
                          {step.duration_minutes && step.duration_minutes > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {step.duration_minutes} хвилин
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Кроки приготування не вказані</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'categories' && (
              <Card>
                <CardHeader>
                  <CardTitle>Категорії</CardTitle>
                </CardHeader>
                <CardContent>
                  {dish.categories && dish.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {dish.categories.map((category, index) => (
                        <div key={index} className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                          <div className="font-medium text-primary-800">
                            {category.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Категорії не вказані</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Moderation Actions */}
          {dish.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Дії модерації</CardTitle>
              </CardHeader>
              <CardContent>
                {!showRejectForm ? (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleApprove}
                      disabled={isUpdating}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Схвалити
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isUpdating}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Відхилити
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Причина відхилення *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Вкажіть причину відхилення страви..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleReject}
                        disabled={isUpdating || !rejectionReason.trim()}
                        leftIcon={<XCircle className="w-4 h-4" />}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Відхилити страву
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectionReason('')
                        }}
                        disabled={isUpdating}
                      >
                        Скасувати
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delete Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Небезпечна зона</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Видалити страву</p>
                  <p className="text-sm text-gray-500">
                    Ця дія незворотна. Страва та всі пов'язані дані будуть видалені.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isUpdating}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Видалити
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}