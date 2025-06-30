'use client'

import { useAdminCategories } from '@/hooks/useAdminCategories'
import { Button } from '@/components/ui/Button'
import { CategoryStatsCards } from '@/components/admin/categories/CategoryStatsCards'
import { CategorySearch } from '@/components/admin/categories/CategorySearch'
import { CategoryTable } from '@/components/admin/categories/CategoryTable'
import { CreateCategoryModal } from '@/components/admin/categories/CreateCategoryModal'
import { EditCategoryModal } from '@/components/admin/categories/EditCategoryModal'
import { Plus } from 'lucide-react'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управління категоріями
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Створюйте, редагуйте та видаляйте категорії страв
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Створити категорію
        </Button>
      </div>

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