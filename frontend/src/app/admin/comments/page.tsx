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
  MessageCircle, 
  Search, 
  Eye, 
  Trash2,
  Filter,
  Calendar,
  User,
  ChefHat,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

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

interface CommentStats {
  total: number
  active: number
  deleted: number
}

interface CommentDetailsModalProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onDelete: (commentId: string) => void
  isUpdating: boolean
}

function CommentDetailsModal({ comment, isOpen, onClose, onDelete, isUpdating }: CommentDetailsModalProps) {
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

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/comments')
      if (response.success && response.comments) {
        setComments(response.comments)
        setFilteredComments(response.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити коментарі')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/comments/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleViewComment = async (commentId: string) => {
    try {
      const response = await apiClient.get(`/admin/comments/${commentId}`)
      if (response.success && response.comment) {
        setSelectedComment(response.comment)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch comment details:', error)
      toast.error('Не вдалося завантажити деталі коментаря')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setIsUpdating(true)
    try {
      const response = await apiClient.delete(`/admin/comments/${commentId}`)
      
      if (response.success) {
        toast.success('Коментар видалено успішно')
        
        // Remove from comments list
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        
        // Close modal if this comment was selected
        if (selectedComment?.id === commentId) {
          setShowDetailsModal(false)
          setSelectedComment(null)
        }
        
        // Refresh stats
        fetchStats()
      } else {
        toast.error(response.error || 'Не вдалося видалити коментар')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити коментар')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [])

  useEffect(() => {
    let filtered = comments

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.dishes.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(comment => !comment.is_deleted)
    } else if (statusFilter === 'deleted') {
      filtered = filtered.filter(comment => comment.is_deleted)
    }

    setFilteredComments(filtered)
  }, [searchQuery, statusFilter, comments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління коментарями
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Модеруйте коментарі користувачів
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього коментарів</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">Активні</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Видалені</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.deleted}</p>
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
                placeholder="Пошук коментарів за змістом, автором або стравою..."
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
                <option value="">Всі коментарі</option>
                <option value="active">Активні</option>
                <option value="deleted">Видалені</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Список коментарів
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || statusFilter ? 'Коментарі не знайдено' : 'Немає коментарів'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Коментар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Страва
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {comment.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={comment.profiles.avatar_url}
                            name={comment.profiles.full_name || comment.profiles.email}
                            size="sm"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {comment.profiles.full_name || 'Невідомо'}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{comment.profiles.profile_tag || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{comment.dishes.title}</div>
                        <div className="text-xs text-gray-500">
                          {comment.dishes.status === 'approved' ? 'Схвалено' : 
                           comment.dishes.status === 'pending' ? 'На розгляді' : 'Відхилено'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatRelativeTime(comment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {comment.is_deleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Видалено
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Активний
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewComment(comment.id)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Переглянути
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Details Modal */}
      <CommentDetailsModal
        comment={selectedComment}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedComment(null)
        }}
        onDelete={handleDeleteComment}
        isUpdating={isUpdating}
      />
    </div>
  )
}