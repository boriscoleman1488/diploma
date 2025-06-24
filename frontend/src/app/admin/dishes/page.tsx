'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  ChefHat, 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  Trash2,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Heart,
  Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Dish {
  id: string
  title: string
  description: string
  main_image_url?: string
  servings: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  moderated_at?: string
  rejection_reason?: string
  user_id: string
  profiles?: {
    full_name?: string
    email: string
    profile_tag?: string
  }
  categories?: Array<{
    dish_categories: {
      id: string
      name: string
    }
  }>
  ratings?: Array<{
    rating_type: number
  }>
  comments_count?: number
}

interface DishStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

interface DishDetailsModalProps {
  dish: Dish | null
  isOpen: boolean
  onClose: () => void
  onModerate: (dishId: string, status: 'approved' | 'rejected', reason?: string) => void
  onDelete: (dishId: string) => void
  isUpdating: boolean
}

function DishDetailsModal({ dish, isOpen, onClose, onModerate, onDelete, isUpdating }: DishDetailsModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!isOpen || !dish) return null

  const handleApprove = () => {
    onModerate(dish.id, 'approved')
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Будь ласка, вкажіть причину відхилення')
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

  const likesCount = dish.ratings?.filter(r => r.rating_type === 1).length || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Деталі страви
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

        <div className="p-6 space-y-6">
          {/* Dish Header */}
          <div className="flex items-start space-x-4">
            {dish.main_image_url && (
              <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={dish.main_image_url}
                  alt={dish.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{dish.title}</h3>
                {getStatusBadge(dish.status)}
              </div>
              <p className="text-gray-600 mb-4">{dish.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {dish.servings} порцій
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {likesCount} лайків
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {dish.comments_count || 0} коментарів
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          {dish.categories && dish.categories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Категорії</h4>
              <div className="flex flex-wrap gap-2">
                {dish.categories
                  .filter(cat => cat && cat.dish_categories && cat.dish_categories.name)
                  .map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {cat.dish_categories.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація про автора</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar
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
                  <p className="text-sm text-gray-500">{dish.profiles?.email}</p>
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

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [stats, setStats] = useState<DishStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([])
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchDishes = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/dishes')
      if (response.success && response.dishes) {
        setDishes(response.dishes)
        setFilteredDishes(response.dishes)
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити страви')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/dishes/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleModerateDish = async (dishId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.patch(`/admin/dishes/moderate/${dishId}`, {
        status,
        rejection_reason: rejectionReason
      })

      if (response.success) {
        toast.success(`Страву ${status === 'approved' ? 'схвалено' : 'відхилено'}`)
        
        // Update dishes list
        setDishes(prev => prev.map(dish => 
          dish.id === dishId 
            ? { ...dish, status, moderated_at: new Date().toISOString(), rejection_reason: rejectionReason }
            : dish
        ))
        
        // Update selected dish
        if (selectedDish?.id === dishId) {
          setSelectedDish(prev => prev ? {
            ...prev,
            status,
            moderated_at: new Date().toISOString(),
            rejection_reason: rejectionReason
          } : null)
        }
        
        // Refresh stats
        fetchStats()
      } else {
        toast.error(response.error || 'Не вдалося модерувати страву')
      }
    } catch (error) {
      console.error('Failed to moderate dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося модерувати страву')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteDish = async (dishId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/dishes/${dishId}`)
      
      if (response.success) {
        toast.success('Страву видалено успішно')
        
        // Remove from dishes list
        setDishes(prev => prev.filter(dish => dish.id !== dishId))
        
        // Close modal if this dish was selected
        if (selectedDish?.id === dishId) {
          setShowDetailsModal(false)
          setSelectedDish(null)
        }
        
        // Refresh stats
        fetchStats()
      } else {
        toast.error(response.error || 'Не вдалося видалити страву')
      }
    } catch (error) {
      console.error('Failed to delete dish:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити страву')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDish = async (dishId: string) => {
    try {
      const response = await apiClient.get(`/admin/dishes/${dishId}`)
      if (response.success && response.dish) {
        setSelectedDish(response.dish)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch dish details:', error)
      toast.error('Не вдалося завантажити деталі страви')
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

  useEffect(() => {
    fetchDishes()
    fetchStats()
  }, [])

  useEffect(() => {
    let filtered = dishes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(dish => dish.status === statusFilter)
    }

    setFilteredDishes(filtered)
  }, [searchQuery, statusFilter, dishes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління стравами
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Модеруйте страви та керуйте контентом платформи
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього страв</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">На розгляді</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Схвалено</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Відхилено</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук страв за назвою, описом або автором..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Всі статуси</option>
                <option value="pending">На розгляді</option>
                <option value="approved">Схвалено</option>
                <option value="rejected">Відхилено</option>
                <option value="draft">Чернетки</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Список страв
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || statusFilter ? 'Страви не знайдено' : 'Немає страв'}
              </p>
            </div>
          ) : (
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
                  {filteredDishes.map((dish) => {
                    const likesCount = dish.ratings?.filter(r => r.rating_type === 1).length || 0
                    
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
                              <MessageSquare className="w-4 h-4 mr-1" />
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
                            onClick={() => handleViewDish(dish.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Dish Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDish(null)
        }}
        onModerate={handleModerateDish}
        onDelete={handleDeleteDish}
        isUpdating={isUpdating}
      />
    </div>
  )
}