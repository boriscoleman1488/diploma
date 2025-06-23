'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { useRecipes } from '@/hooks/useRecipes'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { debounce } from '@/lib/utils'

export function RecipesFilters() {
  const { categories, filters, setFilters } = useRecipes()
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    setFilters({ search: value, page: 1 })
  }, 500)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleCategoryChange = (categoryId: string) => {
    setFilters({ 
      categoryId: categoryId === filters.categoryId ? undefined : categoryId,
      page: 1 
    })
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setFilters({ sortBy, sortOrder, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      search: undefined,
      categoryId: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1
    })
  }

  return (
    <div className="card p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Categories
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categoryId === category.id}
                onChange={() => handleCategoryChange(category.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Sort By
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="sort"
              checked={filters.sortBy === 'created_at' && filters.sortOrder === 'desc'}
              onChange={() => handleSortChange('created_at', 'desc')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Newest First
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sort"
              checked={filters.sortBy === 'created_at' && filters.sortOrder === 'asc'}
              onChange={() => handleSortChange('created_at', 'asc')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Oldest First
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sort"
              checked={filters.sortBy === 'title' && filters.sortOrder === 'asc'}
              onChange={() => handleSortChange('title', 'asc')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              A to Z
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sort"
              checked={filters.sortBy === 'likes' && filters.sortOrder === 'desc'}
              onChange={() => handleSortChange('likes', 'desc')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Most Liked
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}