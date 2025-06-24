'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/lib/utils'
import { 
  MessageCircle, 
  Send, 
  Edit, 
  Trash2, 
  MoreVertical,
  Flag,
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
}

interface CommentSectionProps {
  dishId: string
  className?: string
}

export function CommentSection({ dishId, className = '' }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuthStore()

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/comments/${dishId}`)
      if (response.success && response.comments) {
        setComments(response.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      toast.error('Не вдалося завантажити коментарі')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Коментар не може бути порожнім')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiClient.post(`/comments/${dishId}`, {
        content: newComment.trim()
      })

      if (response.success && response.comment) {
        setComments(prev => [response.comment, ...prev])
        setNewComment('')
        toast.success('Коментар додано успішно')
      } else {
        toast.error(response.message || 'Не вдалося додати коментар')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося додати коментар')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = (commentId: string, content: string) => {
    setEditingComment(commentId)
    setEditContent(content)
    setShowDropdown(null)
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Коментар не може бути порожнім')
      return
    }

    setIsUpdating(true)
    try {
      const response = await apiClient.put(`/comments/${commentId}`, {
        content: editContent.trim()
      })

      if (response.success && response.comment) {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? response.comment : comment
        ))
        setEditingComment(null)
        setEditContent('')
        toast.success('Коментар оновлено успішно')
      } else {
        toast.error(response.message || 'Не вдалося оновити коментар')
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося оновити коментар')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) {
      return
    }

    try {
      const response = await apiClient.delete(`/comments/${commentId}`)
      if (response.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast.success('Коментар видалено успішно')
      } else {
        toast.error(response.message || 'Не вдалося видалити коментар')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити коментар')
    } finally {
      setShowDropdown(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const canEditComment = (comment: Comment) => {
    return user && comment.profiles.email === user.email
  }

  useEffect(() => {
    fetchComments()
  }, [dishId])

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className={className}>
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Коментарі ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишіть ваш коментар..."
            rows={3}
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              leftIcon={isSubmitting ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
            >
              {isSubmitting ? 'Додавання...' : 'Додати коментар'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Щоб залишити коментар, потрібно увійти в систему.
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Поки що немає коментарів</p>
          <p className="text-sm text-gray-500">Станьте першим, хто залишить коментар!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Avatar
                  src={comment.profiles.avatar_url}
                  name={comment.profiles.full_name || comment.profiles.email}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {comment.profiles.full_name || 'Невідомий користувач'}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{comment.profiles.profile_tag || 'user'} • {formatRelativeTime(comment.created_at)}
                        {comment.updated_at !== comment.created_at && (
                          <span className="ml-1">(редаговано)</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Comment Actions */}
                    {isAuthenticated && canEditComment(comment) && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDropdown(showDropdown === comment.id ? null : comment.id)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {showDropdown === comment.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEditComment(comment.id, comment.content)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Edit className="w-3 h-3 mr-2" />
                              Редагувати
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Видалити
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Comment Content */}
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={isUpdating || !editContent.trim()}
                          leftIcon={isUpdating ? <LoadingSpinner size="sm" /> : undefined}
                        >
                          {isUpdating ? 'Збереження...' : 'Зберегти'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          Скасувати
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}