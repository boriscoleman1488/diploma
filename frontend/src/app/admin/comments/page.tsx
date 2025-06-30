'use client'

import { useState } from 'react'
import { useAdminComments } from '@/hooks/useAdminComments'
import { CommentStatsCards } from '@/components/admin/comments/CommentStatsCards'
import { CommentFilters } from '@/components/admin/comments/CommentFilters'
import { CommentsTable } from '@/components/admin/comments/CommentsTable'
import { CommentDetailsModal } from '@/components/admin/comments/CommentDetailsModal'

export default function AdminCommentsPage() {
  const {
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
    handleViewComment,
    handleDeleteComment,
    closeDetailsModal
  } = useAdminComments()

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
      <CommentStatsCards stats={stats} />

      {/* Filters */}
      <CommentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Comments Table */}
      <CommentsTable
        comments={filteredComments}
        isLoading={isLoading}
        onViewComment={handleViewComment}
      />

      {/* Comment Details Modal */}
      <CommentDetailsModal
        comment={selectedComment}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        onDelete={handleDeleteComment}
        isUpdating={isUpdating}
      />
    </div>
  )
}