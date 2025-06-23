import { useEffect } from 'react'
import { useRecipeStore } from '@/store/recipeStore'

export function useRecipes() {
  const {
    recipes,
    currentRecipe,
    categories,
    filters,
    isLoading,
    error,
    pagination,
    fetchRecipes,
    fetchRecipe,
    fetchCategories,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    setFilters,
    clearCurrentRecipe,
    setLoading,
    clearError
  } = useRecipeStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchRecipes()
  }, [filters, fetchRecipes])

  return {
    recipes,
    currentRecipe,
    categories,
    filters,
    isLoading,
    error,
    pagination,
    fetchRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    setFilters,
    clearCurrentRecipe,
    setLoading,
    clearError
  }
}