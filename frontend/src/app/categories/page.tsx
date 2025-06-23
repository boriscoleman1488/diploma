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
  Calendar,
  Hash,
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

  // Calculate stats
  const totalCategories = categories.length
  const totalRecipes = categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0)
  const avgRecipesPerCategory = totalCategories > 0 ? Math.round(totalRecipes / totalCategories) : 0
  const recentCategories = categories.filter(cat => {
    const categoryDate = new Date(cat.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return categoryDate >= weekAgo
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-12 sm:px-12 sm:py-16">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        Категорії рецептів
                      </h1>
                      <p className="text-primary-100 text-lg mt-2">
                        Знайдіть ідеальні рецепти за категоріями або створіть власну
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Grid3X3 className="w-5 h-5 text-primary-100" />
                        <div>
                          <p className="text-2xl font-bold text-white">{totalCategories}</p>
                          <p className="text-primary-100 text-sm">Категорій</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-5 h-5 text-primary-100" />
                        <div>
                          <p className="text-2xl font-bold text-white">{totalRecipes}</p>
                          <p className="text-primary-100 text-sm">Рецептів</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-primary-100" />
                        <div>
                          <p className="text-2xl font-bold text-white">{avgRecipesPerCategory}</p>
                          <p className="text-primary-100 text-sm">Середньо</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-primary-100" />
                        <div>
                          <p className="text-2xl font-bold text-white">{recentCategories}</p>
                          <p className="text-primary-100 text-sm">Нових</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="hidden sm:block ml-8">
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
              
              {/* Mobile Action Button */}
              <div className="sm:hidden mt-6">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-white text-primary-600 hover:bg-gray-50 shadow-lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Створити категорію
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 w-full">
                  <Input
                    placeholder="Пошук категорій за назвою або описом..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    leftIcon={isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                    className="w-full"
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
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800">
                  Знайдено <span className="font-semibold">{searchResults.length}</span> категорій за запитом 
                  "<span className=\"font-semibold">{searchQuery}</span>"
                </p>
              </div>
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
                  ? `Спробуйте інший пошуковий запит або створіть нову категорію`
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

          {/* Additional Stats */}
          {!searchQuery.trim() && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Детальна статистика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {totalCategories}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Всього категорій</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {recentCategories > 0 && `+${recentCategories} цього тижня`}
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {totalRecipes}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Всього рецептів</div>
                    <div className="text-xs text-green-600 mt-1">
                      У всіх категоріях
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {avgRecipesPerCategory}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Середньо на категорію</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Рецептів у кожній
                    </div>
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