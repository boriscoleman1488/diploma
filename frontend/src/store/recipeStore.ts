import { create } from 'zustand'
import { Recipe, RecipeFilters, Category } from '@/types'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface RecipeState {
  recipes: Recipe[]
  currentRecipe: Recipe | null
  categories: Category[]
  filters: RecipeFilters
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Actions
  fetchRecipes: () => Promise<void>
  fetchRecipe: (id: string) => Promise<void>
  fetchCategories: () => Promise<void>
  createRecipe: (data: any) => Promise<boolean>
  updateRecipe: (id: string, data: any) => Promise<boolean>
  deleteRecipe: (id: string) => Promise<boolean>
  setFilters: (filters: Partial<RecipeFilters>) => void
  clearCurrentRecipe: () => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  currentRecipe: null,
  categories: [],
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  },

  fetchRecipes: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const filters = get().filters
      const response = await api.getRecipes(filters)
      
      if (response.success) {
        set({
          recipes: response.dishes || [],
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 12,
            total: response.total || 0,
            totalPages: Math.ceil((response.total || 0) / (filters.limit || 12))
          },
          isLoading: false
        })
      } else {
        set({
          error: response.error || 'Failed to fetch recipes',
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch recipes',
        isLoading: false
      })
    }
  },

  fetchRecipe: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await api.getRecipe(id)
      
      if (response.success) {
        set({
          currentRecipe: response.dish,
          isLoading: false
        })
      } else {
        set({
          error: response.error || 'Recipe not found',
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch recipe',
        isLoading: false
      })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.getCategories()
      
      if (response.success) {
        set({ categories: response.categories || [] })
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
    }
  },

  createRecipe: async (data: any) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await api.createRecipe(data)
      
      if (response.success) {
        set({ isLoading: false })
        toast.success('Recipe created successfully!')
        return true
      } else {
        set({
          error: response.error || 'Failed to create recipe',
          isLoading: false
        })
        return false
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create recipe',
        isLoading: false
      })
      return false
    }
  },

  updateRecipe: async (id: string, data: any) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await api.updateRecipe(id, data)
      
      if (response.success) {
        // Update the recipe in the current list if it exists
        const recipes = get().recipes
        const updatedRecipes = recipes.map(recipe =>
          recipe.id === id ? { ...recipe, ...response.dish } : recipe
        )
        
        set({
          recipes: updatedRecipes,
          currentRecipe: response.dish,
          isLoading: false
        })
        
        toast.success('Recipe updated successfully!')
        return true
      } else {
        set({
          error: response.error || 'Failed to update recipe',
          isLoading: false
        })
        return false
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update recipe',
        isLoading: false
      })
      return false
    }
  },

  deleteRecipe: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await api.deleteRecipe(id)
      
      if (response.success) {
        // Remove the recipe from the current list
        const recipes = get().recipes
        const updatedRecipes = recipes.filter(recipe => recipe.id !== id)
        
        set({
          recipes: updatedRecipes,
          isLoading: false
        })
        
        toast.success('Recipe deleted successfully!')
        return true
      } else {
        set({
          error: response.error || 'Failed to delete recipe',
          isLoading: false
        })
        return false
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete recipe',
        isLoading: false
      })
      return false
    }
  },

  setFilters: (newFilters: Partial<RecipeFilters>) => {
    const currentFilters = get().filters
    set({
      filters: { ...currentFilters, ...newFilters }
    })
  },

  clearCurrentRecipe: () => {
    set({ currentRecipe: null })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  clearError: () => {
    set({ error: null })
  }
}))