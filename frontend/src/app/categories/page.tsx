'use client'

import { useCategories } from '@/hooks/useCategories'
import { CategoryHeader } from '@/components/categories/CategoryHeader'
import { CategorySearch } from '@/components/categories/CategorySearch'
import { CategoryList } from '@/components/categories/CategoryList'

export default function CategoriesPage() {
  const {
    filteredCategories,
    isLoading,
    searchQuery,
    setSearchQuery
  } = useCategories()

  return (
    <div className="space-y-6">
      {/* Header */}
      <CategoryHeader />

      {/* Search */}
      <CategorySearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Categories Grid */}
      <CategoryList 
        categories={filteredCategories}
        isLoading={isLoading}
      />
    </div>
  )
}