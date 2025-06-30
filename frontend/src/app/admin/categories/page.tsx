'use client'

import { useAdminCategories } from '@/hooks/useAdminCategories'
import { CategoryHeader } from '@/components/admin/categories/CategoryHeader'
import { CategoryStatsCards } from '@/components/admin/categories/CategoryStatsCards'
import { CategorySearch } from '@/components/admin/categories/CategorySearch'
import { CategoryTable } from '@/components/admin/categories/CategoryTable'
import { CreateCategoryModal } from '@/components/admin/categories/CreateCategoryModal'
import { EditCategoryModal } from '@/components/admin/categories/EditCategoryModal'

export default function AdminCategoriesPage() {
  const {
    categories,
    filteredCategories,
    isLoading,
    isDeleting,
    searchQuery,
    showCreateModal,
    showEditModal,
    editingCategory,
    setSearchQuery,
    setShowCreateModal,
    handleDeleteCategory,
    handleEditCategory,
    handleCloseEditModal,
    fetchCategories
  } = useAdminCategories()

  // Calculate stats
  const totalCategories = categories.length
  const totalDishes = categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)
  const emptyCategories = categories.filter(cat => (cat.dishes_count || 0) === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <CategoryHeader onCreateClick={() => setShowCreateModal(true)} />

      {/* Stats */}
      <CategoryStatsCards 
        totalCategories={totalCategories}
        totalDishes={totalDishes}
        emptyCategories={emptyCategories}
      />

      {/* Search */}
      <CategorySearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Categories Table */}
      <CategoryTable 
        categories={filteredCategories}
        isLoading={isLoading}
        isDeleting={isDeleting}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCategories}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={showEditModal}
        category={editingCategory}
        onClose={handleCloseEditModal}
        onSuccess={fetchCategories}
      />
    </div>
  )
}