'use client'

import { useState } from 'react'
import { useAdminAiChat } from '@/hooks/useAdminAiChat'
import { AiChatStatsCards } from '@/components/admin/ai-chat/AiChatStatsCards'
import { AiChatFilters } from '@/components/admin/ai-chat/AiChatFilters'
import { AiChatSessionsTable } from '@/components/admin/ai-chat/AiChatSessionsTable'
import { AiChatSessionModal } from '@/components/admin/ai-chat/AiChatSessionModal'
import { AiChatMessageSearch } from '@/components/admin/ai-chat/AiChatMessageSearch'
import { ActiveUsersCard } from '@/components/admin/ai-chat/ActiveUsersCard'
import { debounce } from '@/lib/utils'

export default function AdminAiChatPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'search'>('sessions')
  const [showSessionModal, setShowSessionModal] = useState(false)
  
  const {
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
    setSearchQuery,
    setUserFilter,
    fetchSessions,
    fetchSessionDetails,
    searchMessages,
    deleteSession,
    clearSelectedSession,
    clearSearchResults
  } = useAdminAiChat()

  const debouncedSessionSearch = debounce((query: string) => {
    fetchSessions(1, pagination.limit, query, userFilter)
  }, 500)

  const debouncedMessageSearch = debounce((query: string) => {
    searchMessages(query, 1)
  }, 500)

  const handleSessionSearch = (query: string) => {
    debouncedSessionSearch(query)
  }

  const handleMessageSearch = (query: string) => {
    setSearchQuery(query)
    debouncedMessageSearch(query)
  }

  const handleViewSession = async (sessionId: string) => {
    const success = await fetchSessionDetails(sessionId)
    if (success) {
      setShowSessionModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowSessionModal(false)
    clearSelectedSession()
  }

  const handlePageChange = (page: number) => {
    if (activeTab === 'sessions') {
      fetchSessions(page, pagination.limit, '', userFilter)
    } else {
      searchMessages(searchQuery, page)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління AI-чатом
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Моніторинг та модерація AI-чатів користувачів
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <AiChatStatsCards stats={stats} />

      {/* Active Users */}
      <ActiveUsersCard activeUsers={activeUsers} />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sessions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Сесії чатів
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Пошук повідомлень
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sessions' ? (
        <>
          {/* Filters */}
          <AiChatFilters 
            onSearch={handleSessionSearch}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
          />

          {/* Sessions Table */}
          <AiChatSessionsTable 
            sessions={sessions}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onViewSession={handleViewSession}
            onDeleteSession={deleteSession}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <>
          {/* Message Search */}
          <AiChatMessageSearch 
            searchQuery={searchQuery}
            onSearch={handleMessageSearch}
            searchResults={searchResults}
            isSearching={isSearching}
            pagination={searchPagination}
            onPageChange={handlePageChange}
            onClearResults={clearSearchResults}
          />
        </>
      )}

      {/* Session Details Modal */}
      <AiChatSessionModal
        session={selectedSession}
        messages={sessionMessages}
        isOpen={showSessionModal}
        onClose={handleCloseModal}
        onDelete={deleteSession}
        isDeleting={isDeleting}
      />
    </div>
  )
}