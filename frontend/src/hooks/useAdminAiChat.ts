import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { 
  AiChatSession, 
  AiChatMessage, 
  AiChatStats, 
  ActiveUser 
} from '@/types/aiChat'
import toast from 'react-hot-toast'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useAdminAiChat() {
  const [sessions, setSessions] = useState<AiChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<AiChatSession | null>(null)
  const [sessionMessages, setSessionMessages] = useState<AiChatMessage[]>([])
  const [searchResults, setSearchResults] = useState<AiChatMessage[]>([])
  const [stats, setStats] = useState<AiChatStats | null>(null)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [searchPagination, setSearchPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/ai/stats')
      if (response.success && response.stats) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch AI chat stats:', error)
    }
  }, [])

  const fetchSessions = useCallback(async (page: number = 1, limit: number = 20, search: string = '', userId: string = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(userId && { userId })
      })

      const response = await apiClient.get(`/admin/ai/sessions?${params}`)
      
      if (response.success) {
        setSessions(response.sessions || [])
        setPagination(response.pagination || { page, limit, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch AI chat sessions:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити сесії чату')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSessionDetails = useCallback(async (sessionId: string) => {
    try {
      const response = await apiClient.get(`/admin/ai/sessions/${sessionId}`)
      if (response.success) {
        setSelectedSession(response.session)
        setSessionMessages(response.messages || [])
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to fetch session details:', error)
      toast.error('Не вдалося завантажити деталі сесії')
      return false
    }
  }, [])

  const searchMessages = useCallback(async (query: string, page: number = 1, role?: string, userId?: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        page: page.toString(),
        limit: '20',
        ...(role && { role }),
        ...(userId && { userId })
      })

      const response = await apiClient.get(`/admin/ai/messages/search?${params}`)
      
      if (response.success) {
        setSearchResults(response.messages || [])
        setSearchPagination(response.pagination || { page, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Failed to search messages:', error)
      toast.error('Не вдалося знайти повідомлення')
    } finally {
      setIsSearching(false)
    }
  }, [])

  const fetchActiveUsers = useCallback(async () => {
    try {
      const response = await apiClient.get('/admin/ai/users/active?limit=10')
      if (response.success && response.activeUsers) {
        setActiveUsers(response.activeUsers)
      }
    } catch (error) {
      console.error('Failed to fetch active users:', error)
    }
  }, [])

  const deleteSession = useCallback(async (sessionId: string, sessionTitle: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити чат "${sessionTitle}"? Ця дія незворотна.`)) {
      return false
    }

    setIsDeleting(sessionId)
    try {
      const response = await apiClient.delete(`/admin/ai/sessions/${sessionId}`)
      
      if (response.success) {
        toast.success('Чат успішно видалено')
        
        // Remove from sessions list
        setSessions(prev => prev.filter(session => session.id !== sessionId))
        
        // Clear selected session if it was deleted
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null)
          setSessionMessages([])
        }
        
        // Refresh stats
        fetchStats()
        return true
      } else {
        toast.error(response.error || 'Не вдалося видалити чат')
        return false
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити чат')
      return false
    } finally {
      setIsDeleting(null)
    }
  }, [fetchStats, selectedSession])

  const clearSelectedSession = useCallback(() => {
    setSelectedSession(null)
    setSessionMessages([])
  }, [])

  const clearSearchResults = useCallback(() => {
    setSearchResults([])
    setSearchQuery('')
  }, [])

  // Fetch initial data
  useEffect(() => {
    fetchStats()
    fetchSessions()
    fetchActiveUsers()
  }, [fetchStats, fetchSessions, fetchActiveUsers])

  return {
    // State
    sessions,
    selectedSession,
    sessionMessages,
    searchResults,
    stats,
    activeUsers,
    isLoading,
    isDeleting,
    isSearching,
    searchQuery,
    userFilter,
    pagination,
    searchPagination,
    
    // Setters
    setSearchQuery,
    setUserFilter,
    
    // Actions
    fetchStats,
    fetchSessions,
    fetchSessionDetails,
    searchMessages,
    fetchActiveUsers,
    deleteSession,
    clearSelectedSession,
    clearSearchResults
  }
}