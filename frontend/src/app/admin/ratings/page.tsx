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
  Heart, 
  Search, 
  Eye, 
  Trash2,
  Filter,
  Calendar,
  User,
  ChefHat,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Rating {
  id: string
  rating_type: number
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

interface RatingStats {
  total: number
  likes: number
  dislikes: number
  likeRatio: number
  weekly: {
    total: number
    likes: number
    dislikes: number
  }
  monthly: {
    total: number
    likes: number
    dislikes: number
  }
}

interface RatingDetailsModalProps {
  rating: Rating | null
  isOpen: boolean
  onClose: () => void
  onDelete: (ratingId: string) => void
  isUpdating: boolean
}

function RatingDetailsModal({ rating, isOpen, onClose, onDelete, isUpdating }: RatingDetailsModalProps) {
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
                  <Heart className={`w-5 h-5 text-red-600 ${rating.rating_type === 1 ? 'fill-current' : ''}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {rating.rating_type === 1 ? 'Лайк' : 'Без рейтингу'}
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

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dishFilter, setDishFilter] = useState<string>('')
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([])
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchRatings = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/ratings')
      if (response.success && response.ratings) {
        setRatings(response.ratings)
        setFilteredRatings(response.ratings)
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити рейтинги')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/ratings/stats/overview')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleViewRating = async (ratingId: string) => {
    try {
      const response = await apiClient.get(`/admin/ratings/${ratingId}`)
      if (response.success && response.rating) {
        setSelectedRating(response.rating)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch rating details:', error)
      toast.error('Не вдалося завантажити деталі рейтингу')
    }
  }

  const handleDeleteRating = async (ratingId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/ratings/${ratingId}`)
      
      if (response.success) {
        toast.success('Рейтинг видалено успішно')
        
        // Remove from ratings list
        setRatings(prev => prev.filter(rating => rating.id !== ratingId))
        
        // Close modal if this rating was selected
        if (selectedRating?.id === ratingId) {
          setShowDetailsModal(false)
          setSelectedRating(null)
        }
        
        // Refresh stats
        fetchStats()
      } else {
        toast.error(response.error || 'Не вдалося видалити рейтинг')
      }
    } catch (error) {
      console.error('Failed to delete rating:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити рейтинг')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchRatings()
    fetchStats()
  }, [])

  useEffect(() => {
    let filtered = ratings

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(rating =>
        rating.dishes.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rating.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by dish status
    if (dishFilter) {
      filtered = filtered.filter(rating => rating.dishes.status === dishFilter)
    }

    setFilteredRatings(filtered)
  }, [searchQuery, dishFilter, ratings])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління рейтингами
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Перегляд та модерація рейтингів користувачів
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього лайків</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.likes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього рейтингів</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">За тиждень</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weekly.likes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">За місяць</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthly.likes}</p>
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
                placeholder="Пошук рейтингів за назвою страви або автором..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="md:w-48">
              <select
                value={dishFilter}
                onChange={(e) => setDishFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Всі страви</option>
                <option value="approved">Схвалені страви</option>
                <option value="pending">Страви на розгляді</option>
                <option value="rejected">Відхилені страви</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Список рейтингів
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredRatings.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || dishFilter ? 'Рейтинги не знайдено' : 'Немає рейтингів'}
              </p>
            </div>
          ) : (
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
                  {filteredRatings.map((rating) => (
                    <tr key={rating.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className={`w-5 h-5 text-red-500 ${rating.rating_type === 1 ? 'fill-current' : ''}`} />
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {rating.rating_type === 1 ? 'Лайк' : 'Без рейтингу'}
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
                            onClick={() => handleViewRating(rating.id)}
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            Переглянути
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRating(rating.id)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
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
          )}
        </CardContent>
      </Card>

      {/* Rating Details Modal */}
      <RatingDetailsModal
        rating={selectedRating}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedRating(null)
        }}
        onDelete={handleDeleteRating}
        isUpdating={isUpdating}
      />
    </div>
  )
}