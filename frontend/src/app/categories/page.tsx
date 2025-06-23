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
  ChefHat,
  TrendingUp,
  Users,
  Sparkles,
  BookOpen,
  Star,
  Filter,
  SortAsc,
  BarChart3
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
      {/* Hero Header with Enhanced Design */}
      <div className="relative overflow-hidden">
        {/* Background with multiple gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Icon with Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl animate-pulse"></div>
                <div className="relative p-6 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30">
                  <ChefHat className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            
            {/* Title with Enhanced Typography */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Категорії рецептів
              <div className="inline-block ml-4 animate-bounce">
                <Sparkles className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
              </div>
            </h1>
            
            {/* Subtitle with Better Spacing */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Відкрийте світ кулінарних можливостей через наші ретельно організовані категорії рецептів
            </p>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <Grid3X3 className="w-8 h-8 text-white mr-3" />
                  <div className="text-4xl font-bold text-white">{categories.length}</div>
                </div>
                <div className="text-white/80 text-lg font-medium">Категорій</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <BookOpen className="w-8 h-8 text-white mr-3" />
                  <div className="text-4xl font-bold text-white">{totalDishes}</div>
                </div>
                <div className="text-white/80 text-lg font-medium">Рецептів</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <BarChart3 className="w-8 h-8 text-white mr-3" />
                  <div className="text-4xl font-bold text-white">
                    {categories.length > 0 ? Math.round(totalDishes / categories.length) : 0}
                  </div>
                </div>
                <div className="text-white/80 text-lg font-medium">Середньо на категорію</div>
              </div>
            </div>
            
            {/* CTA Button with Enhanced Design */}
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
              leftIcon={<Plus className="w-6 h-6" />}
            >
              Створити нову категорію
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Enhanced Search and Filters */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-5 h-5" />}
                    </div>
                    <input
                      type="text"
                      placeholder="Пошук категорій за назвою або описом..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      leftIcon={<Grid3X3 className="w-4 h-4" />}
                      className="rounded-lg"
                    >
                      Сітка
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      leftIcon={<List className="w-4 h-4" />}
                      className="rounded-lg"
                    >
                      Список
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Filter className="w-4 h-4" />}
                    className="rounded-xl"
                  >
                    Фільтри
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<SortAsc className="w-4 h-4" />}
                    className="rounded-xl"
                  >
                    Сортування
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results Info with Enhanced Design */}
          {isShowingSearchResults && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-xl mr-4">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Результати пошуку
                  </h3>
                  <p className="text-blue-700">
                    Знайдено {searchResults.length} категорій за запитом "{searchQuery}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid/List with Enhanced Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-200 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-6 bg-white rounded-full shadow-xl">
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Завантаження категорій</h3>
                <p className="text-gray-600 text-lg">Підготовуємо для вас найкращі категорії...</p>
              </div>
            </div>
          ) : displayCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="text-9xl mb-4 animate-bounce">📂</div>
                <div className="absolute inset-0 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery.trim() ? 'Категорії не знайдено' : 'Немає категорій'}
              </h3>
              <p className="text-gray-600 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
                {searchQuery.trim() 
                  ? `Спробуйте інший пошуковий запит або створіть нову категорію "${searchQuery}"`
                  : 'Створіть першу категорію для організації рецептів та почніть свою кулінарну подорож'
                }
              </p>
              {!searchQuery.trim() && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  leftIcon={<Plus className="w-6 h-6" />}
                  className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Створити першу категорію
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-6'
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

          {/* Enhanced Stats Section */}
          {!searchQuery.trim() && categories.length > 0 && (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-2xl font-bold">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl mr-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  Статистика категорій
                  <Star className="w-6 h-6 ml-3 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl w-fit mx-auto mb-4">
                      <Grid3X3 className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {categories.length}
                    </div>
                    <div className="text-gray-600 font-semibold text-lg">Всього категорій</div>
                  </div>
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl w-fit mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {totalDishes}
                    </div>
                    <div className="text-gray-600 font-semibold text-lg">Всього рецептів</div>
                  </div>
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl w-fit mx-auto mb-4">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {Math.round(categories.reduce((sum, cat) => sum + (cat.dishes_count || 0), 0) / categories.length) || 0}
                    </div>
                    <div className="text-gray-600 font-semibold text-lg">Середньо на категорію</div>
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