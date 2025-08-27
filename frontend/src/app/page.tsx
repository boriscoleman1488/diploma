'use client'

import { useRef } from 'react'
import { useDishes } from '@/hooks/useDishes'
import { useCategories } from '@/hooks/useCategories'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { Filters } from '@/components/home/Filters'
import { DishCard } from '@/components/home/DishCard'
import { DishDetailsModal } from '@/components/home/DishDetailsModal'
import { EmptyState } from '@/components/home/EmptyState'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated } = useAuthStore()
  const { categories } = useCategories()
  
  const {
    dishes,
    filteredDishes,
    isLoading,
    searchQuery,
    selectedCategory,
    sortBy,
    cookingTime,
    servingsCount,
    hasNutrition,
    selectedDish,
    showDetailsModal,
    ratingFilter,
    stepsFilter,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    setCookingTime,
    setServingsCount,
    setHasNutrition,
    resetFilters,
    setRatingFilter,
    setStepsFilter,
    viewDishDetails,
    closeDetailsModal
  } = useDishes()

  const handleSearchClick = () => {
    // Focus the search input when the search button is clicked
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Calculate stats
  const totalDishes = dishes.length
  const approvedDishes = dishes.filter(d => d.status === 'approved').length
  const totalChefs = new Set(dishes.map(d => d.user_id)).size
  const dishesWithNutrition = dishes.filter(d => d.ingredients && d.ingredients.length > 0).length

  const hasFilters = !!(searchQuery || selectedCategory || sortBy !== 'newest' || 
                      cookingTime || servingsCount || hasNutrition || ratingFilter || stepsFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection onSearchClick={handleSearchClick} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <StatsSection 
          totalDishes={totalDishes}
          approvedDishes={approvedDishes}
          totalChefs={totalChefs}
          dishesWithNutrition={dishesWithNutrition}
        />

        {/* Search and Filters */}
        <Filters 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          cookingTime={cookingTime}
          setCookingTime={setCookingTime}
          servingsCount={servingsCount}
          setServingsCount={setServingsCount}
          hasNutrition={hasNutrition}
          setHasNutrition={setHasNutrition}
          onReset={resetFilters}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          stepsFilter={stepsFilter}
          setStepsFilter={setStepsFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
        />

        {/* Dishes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Завантаження страв...</p>
            </div>
          </div>
        ) : filteredDishes.length === 0 ? (
          <EmptyState 
            hasFilters={hasFilters}
            onResetFilters={resetFilters}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {hasFilters ? 'Результати пошуку' : 'Популярні страви'}
              </h2>
              <p className="text-gray-600">
                Знайдено {filteredDishes.length} {filteredDishes.length === 1 ? 'страва' : 'страв'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <DishCard 
                  key={dish.id} 
                  dish={dish} 
                  onViewDetails={() => viewDishDetails(dish.id)}
                />
              ))}
            </div>

            {/* Load More Button (for future pagination) */}
            {filteredDishes.length >= 12 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<TrendingUp className="w-4 h-4" />}
                >
                  Завантажити більше страв
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dish Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
      />
    </div>
  )
}