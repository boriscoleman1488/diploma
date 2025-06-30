'use client'

import { useAdminDishes } from '@/hooks/useAdminDishes'
import { DishStatsCards } from '@/components/admin/dishes/DishStatsCards'
import { DishFilters } from '@/components/admin/dishes/DishFilters'
import { DishesTable } from '@/components/admin/dishes/DishesTable'
import { DishDetailsModal } from '@/components/admin/dishes/DishDetailsModal'

export default function AdminDishesPage() {
  const {
    filteredDishes,
    stats,
    isLoading,
    isUpdating,
    searchQuery,
    statusFilter,
    selectedDish,
    showDetailsModal,
    setSearchQuery,
    setStatusFilter,
    handleViewDish,
    handleModerateDish,
    handleDeleteDish,
    closeDetailsModal
  } = useAdminDishes()

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
      <DishStatsCards stats={stats} />

      {/* Filters */}
      <DishFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Dishes Table */}
      <DishesTable 
        dishes={filteredDishes}
        isLoading={isLoading}
        onViewDish={handleViewDish}
      />

      {/* Dish Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        onModerate={handleModerateDish}
        onDelete={handleDeleteDish}
        isUpdating={isUpdating}
      />
    </div>
  )
}