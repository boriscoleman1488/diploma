'use client'

import { useAuthStore } from '@/store/authStore'
import { useDishesPage } from '@/hooks/useDishesPage'
import { DishesHeader } from '@/components/dishes/DishesHeader'
import { DishesFilters } from '@/components/dishes/DishesFilters'
import { DishesGrid } from '@/components/dishes/DishesGrid'
import { DishDetailsModal } from '@/components/home/DishDetailsModal'

export default function DishesPage() {
  const { isAuthenticated } = useAuthStore()
  
  const {
    dishes,
    categories,
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
    hasFilters,
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
  } = useDishesPage()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DishesHeader 
          totalDishes={dishes.length}
          filteredCount={filteredDishes.length}
          hasFilters={hasFilters}
        />

        {/* Filters */}
        <DishesFilters 
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
        />

        {/* Dishes Grid */}
        <DishesGrid 
          dishes={filteredDishes}
          isLoading={isLoading}
          hasFilters={hasFilters}
          onResetFilters={resetFilters}
          isAuthenticated={isAuthenticated}
          onViewDetails={viewDishDetails}
        />

        {/* Dish Details Modal */}
        <DishDetailsModal
          dish={selectedDish}
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
        />
      </div>
    </div>
  )
}