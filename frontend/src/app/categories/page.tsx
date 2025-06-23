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
  Filter,
  ChefHat,
  TrendingUp,
  Users,
  Sparkles
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
  const totalDishes = categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Категорії рецептів
              <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-300" />
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Знайдіть ідеальні рецепти за категоріями або створіть власну колекцію кулінарних шедеврів
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{categories.length}</div>
                <div className="text-white/80 text-sm">Категорій</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{totalDishes}</div>
                <div className="text-white/80 text-sm">Рецептів</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {categories.length > 0 ? Math.round(totalDishes / categories.length) : 0}
                </div>
                <div className="text-white/80 text-sm">Середньо на категорію</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-50 shadow-lg"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Створити категорію
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Search and Filters */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Пошук категорій за назвою або описом..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                    className="text-lg py-3"
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 font-medium">
                  Знайдено {searchResults.length} категорій за запитом "{searchQuery}"
                </p>
              </div>
            </div>
          )}

          {/* Categories Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 text-lg">Завантаження категорій...</p>
              </div>
            </div>
          ) : displayCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📂</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery.trim() ? 'Категорії не знайдено' : 'Немає категорій'}
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                {searchQuery.trim() 
                  ? `Спробуйте інший пошуковий запит або створіть нову категорію`
                  : 'Створіть першу категорію для організації рецептів та почніть свою кулінарну подорож'
                }
              </p>
              {!searchQuery.trim() && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Створити першу категорію
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

          {/* Stats Section */}
          {!searchQuery.trim() && categories.length > 0 && (
            <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="w-6 h-6 mr-3 text-primary-600" />
                  Статистика категорій
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {categories.length}
                    </div>
                    <div className="text-gray-600 font-medium">Всього категорій</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {totalDishes}
                    </div>
                    <div className="text-gray-600 font-medium">Всього рецептів</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0) / categories.length) || 0}
                    </div>
                    <div className="text-gray-600 font-medium">Середньо на категорію</div>
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