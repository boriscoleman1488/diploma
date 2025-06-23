export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  dishes_count?: number
}

export interface CreateCategoryData {
  name: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
}

export interface CategoriesResponse {
  success: boolean
  categories: Category[]
  error?: string
  message?: string
}

export interface CategoryResponse {
  success: boolean
  category?: Category
  error?: string
  message?: string
}

export interface CategoryStats {
  total: number
  mostUsed: Category[]
  recentlyCreated: Category[]
}