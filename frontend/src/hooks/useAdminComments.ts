import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  dish_id: string
  user_id: string
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

export function useAdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const fetchComments = useCallback(async () => {
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
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/comments/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  const handleViewComment = useCallback(async (commentId: string) => {
    try {
      const response = await apiClient.get(`/admin/comments/${commentId}`)
      if (response.success && response.comment) {
        setSelectedComment(response.comment)
        setShowDetailsModal(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch comment details:', error)
      toast.error('Не вдалося завантажити деталі коментаря')
      return false
    }
  }, [])

  const handleDeleteComment = useCallback(async (commentId: string) => {
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
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити коментар')
        return false
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити коментар')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [fetchStats, selectedComment])

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedComment(null)
  }, [])

  // Apply filters when search query or status filter changes
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

  // Fetch comments and stats on mount
  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [fetchComments, fetchStats])

  return {
    comments,
    filteredComments,
    stats,
    isLoading,
    isUpdating,
    searchQuery,
    statusFilter,
    selectedComment,
    showDetailsModal,
    setSearchQuery,
    setStatusFilter,
    fetchComments,
    fetchStats,
    handleViewComment,
    handleDeleteComment,
    closeDetailsModal
  }
}