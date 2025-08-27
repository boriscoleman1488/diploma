import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  Search, 
  X, 
  SlidersHorizontal
} from 'lucide-react'
import { Category } from '@/types/category'

interface FiltersProps {
  categories: Category[]
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  cookingTime: string
  setCookingTime: (value: string) => void
  servingsCount: string
  setServingsCount: (value: string) => void
  hasNutrition: boolean
  setHasNutrition: (value: boolean) => void
  onReset: () => void
  ratingFilter: string
  setRatingFilter: (value: string) => void
  stepsFilter: string
  setStepsFilter: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  searchInputRef?: React.RefObject<HTMLInputElement>
}

export function Filters({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  cookingTime,
  setCookingTime,
  servingsCount,
  setServingsCount,
  hasNutrition,
  setHasNutrition,
  onReset,
  ratingFilter,
  setRatingFilter,
  stepsFilter,
  setStepsFilter,
  searchQuery,
  setSearchQuery,
  searchInputRef
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                id="search-input"
                placeholder="Пошук страв за назвою, описом, автором або @тегом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                ref={searchInputRef}
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Всі категорії</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              {showFilters ? 'Приховати фільтри' : 'Додаткові фільтри'}
            </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сортувати за
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="newest">Найновіші</option>
                  <option value="oldest">Найстаріші</option>
                  <option value="rating">За рейтингом</option>
                  <option value="popular">За популярністю</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  За рейтингом
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-який рейтинг</option>
                  <option value="no-likes">Без лайків</option>
                  <option value="few-likes">1-5 лайків</option>
                  <option value="popular">6-15 лайків</option>
                  <option value="very-popular">15+ лайків</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  За складністю
                </label>
                <select
                  value={stepsFilter}
                  onChange={(e) => setStepsFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-яка складність</option>
                  <option value="simple">Прості (1-3 кроки)</option>
                  <option value="medium">Середні (4-7 кроків)</option>
                  <option value="complex">Складні (8+ кроків)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Час приготування
                </label>
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-який час</option>
                  <option value="quick">Швидко (до 30 хв)</option>
                  <option value="medium">Середній (30-60 хв)</option>
                  <option value="long">Довго (більше 60 хв)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Кількість порцій
                </label>
                <select
                  value={servingsCount}
                  onChange={(e) => setServingsCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Будь-яка кількість</option>
                  <option value="1-2">1-2 порції</option>
                  <option value="3-4">3-4 порції</option>
                  <option value="5+">5+ порцій</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  З аналізом калорій
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasNutrition}
                    onChange={(e) => setHasNutrition(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Тільки з поживною цінністю</span>
                </label>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Скинути фільтри
                </Button>
              </div>
            </div>
          )}
          
          {/* Active filters display */}
          {(searchQuery || selectedCategory || sortBy !== 'newest' || cookingTime || servingsCount || hasNutrition || ratingFilter || stepsFilter) && (
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-sm text-gray-500">Активні фільтри:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Пошук: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Категорія: {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {ratingFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  Рейтинг: {
                    ratingFilter === 'no-likes' ? 'Без лайків' :
                    ratingFilter === 'few-likes' ? '1-5 лайків' :
                    ratingFilter === 'popular' ? '6-15 лайків' :
                    ratingFilter === 'very-popular' ? '15+ лайків' : ''
                  }
                  <button
                    onClick={() => setRatingFilter('')}
                    className="ml-1 text-pink-600 hover:text-pink-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {stepsFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Складність: {
                    stepsFilter === 'simple' ? 'Прості' :
                    stepsFilter === 'medium' ? 'Середні' :
                    stepsFilter === 'complex' ? 'Складні' : ''
                  }
                  <button
                    onClick={() => setStepsFilter('')}
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Сортування: {
                    sortBy === 'oldest' ? 'Найстаріші' :
                    sortBy === 'popular' ? 'За популярністю' :
                    sortBy === 'rating' ? 'За рейтингом' : ''
                  }
                  <button
                    onClick={() => setSortBy('newest')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {cookingTime && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Час: {
                    cookingTime === 'quick' ? 'До 30 хв' :
                    cookingTime === 'medium' ? '30-60 хв' :
                    cookingTime === 'long' ? 'Більше 60 хв' : ''
                  }
                  <button
                    onClick={() => setCookingTime('')}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {servingsCount && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Порції: {
                    servingsCount === '1-2' ? '1-2 порції' :
                    servingsCount === '3-4' ? '3-4 порції' :
                    servingsCount === '5+' ? '5+ порцій' : ''
                  }
                  <button
                    onClick={() => setServingsCount('')}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {hasNutrition && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  З аналізом калорій
                  <button
                    onClick={() => setHasNutrition(false)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}