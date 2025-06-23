'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CreateCategoryModal } from '@/components/categories/CreateCategoryModal'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { formatDate, debounce } from '@/lib/utils'
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List,
  Filter
} from 'lucide-react'

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const {
    categories,
    isLoading,
    searchCategories,
    createCategory,
    isUpdating
  } = useCategories()

  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const result = await searchCategories(query)
    if (result.success) {
      setSearchResults(result.categories)
    }
    setIsSearching(false)
  }, 500)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const handleCreateCategory = async (data: { name: string; description?: string }) => {
    const result = await createCategory(data)
    if (result.success) {
      setShowCreateModal(false)
    }
  }

  const displayCategories = searchQuery.trim() ? searchResults : categories
  const isShowingSearchResults = searchQuery.trim() && searchResults.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Категорії рецептів
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Знайдіть рецепти за категоріями або створіть нову
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Створити категорію
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Пошук категорій..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    leftIcon={<Grid3X3 className="w-4 h-4" />}
                  >
                    Сітка
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    leftIcon={<List className="w-4 h-4" />}
                  >
                    Список
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results Info */}
          {isShowingSearchResults && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Знайдено {searchResults.length} категорій за запитом "{searchQuery}"
              </p>
            </div>
          )}

          {/* Categories Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Завантаження категорій...</p>
              </div>
            </div>
          ) : displayCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery.trim() ? 'Категорії не знайдено' : 'Немає категорій'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery.trim() 
                  ? `Спробуйте інший пошуковий запит`
                  : 'Створіть першу категорію для організації рецептів'
                }
              </p>
              {!searchQuery.trim() && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Створити категорію
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {displayCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          {!searchQuery.trim() && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Статистика категорій</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {categories.length}
                    </div>
                    <div className="text-sm text-gray-600">Всього категорій</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Всього рецептів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0) / categories.length) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Середньо на категорію</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Category Modal */}
        {showCreateModal && (
          <CreateCategoryModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCategory}
            isLoading={isUpdating}
          />
        )}
      </div>
    </div>
  )
}