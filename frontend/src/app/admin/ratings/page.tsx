import { useAdminRatings } from '@/hooks/useAdminRatings'
import { RatingStatsCards } from '@/components/admin/ratings/RatingStatsCards'
import { RatingFilters } from '@/components/admin/ratings/RatingFilters'
import { RatingsTable } from '@/components/admin/ratings/RatingsTable'
import { RatingDetailsModal } from '@/components/admin/ratings/RatingDetailsModal'

export default function AdminRatingsPage() {
  const {
    filteredRatings,
    stats,
    isLoading,
    isUpdating,
    searchQuery,
    dishFilter,
    selectedRating,
    showDetailsModal,
    setSearchQuery,
    setDishFilter,
    handleViewRating,
    handleDeleteRating,
    closeDetailsModal
  } = useAdminRatings()

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
      <RatingStatsCards stats={stats} />

      {/* Filters */}
      <RatingFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dishFilter={dishFilter}
        setDishFilter={setDishFilter}
      />

      {/* Ratings Table */}
      <RatingsTable
        ratings={filteredRatings}
        isLoading={isLoading}
        onViewRating={handleViewRating}
        onDeleteRating={handleDeleteRating}
        isUpdating={isUpdating}
      />

      {/* Rating Details Modal */}
      <RatingDetailsModal
        rating={selectedRating}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        onDelete={handleDeleteRating}
        isUpdating={isUpdating}
      />
    </div>
  )
}