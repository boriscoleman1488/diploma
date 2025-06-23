export interface User {
  id: string
  email: string
  fullName: string
  profileTag?: string
  avatarUrl?: string
  role: 'user' | 'admin'
  emailConfirmed: boolean
  lastSignIn?: string
  createdAt: string
  updatedAt: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  mainImageUrl?: string
  servings: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  userId: string
  moderatedAt?: string
  rejectionReason?: string
  ingredients: Ingredient[]
  steps: RecipeStep[]
  categories: Category[]
  author: {
    fullName: string
    profileTag: string
    avatarUrl?: string
  }
  ratings: {
    likes: number
    total: number
    ratio: number
  }
  commentsCount: number
  isLiked?: boolean
}

export interface Ingredient {
  id?: string
  name: string
  amount: number
  unit: string
  edamamFoodId?: string
  orderIndex?: number
}

export interface RecipeStep {
  id?: string
  stepNumber: number
  description: string
  imageUrl?: string
  durationMinutes?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  dishId: string
  userId: string
  author: {
    fullName: string
    avatarUrl?: string
  }
}

export interface Collection {
  id: string
  name: string
  description?: string
  collectionType: 'custom' | 'system'
  systemType?: 'my_dishes' | 'liked' | 'published' | 'private'
  isPublic: boolean
  userId: string
  createdAt: string
  updatedAt: string
  items: CollectionItem[]
}

export interface CollectionItem {
  id: string
  collectionId: string
  dishId: string
  userId: string
  addedAt: string
  dish: Recipe
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  success: boolean
  user?: User
  session?: {
    access_token: string
    refresh_token: string
    expires_at: number
    expires_in: number
    token_type: string
  }
  message?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName: string
}

export interface UpdateProfileData {
  fullName?: string
  profileTag?: string
  avatarUrl?: string
}

export interface CreateRecipeData {
  title: string
  description: string
  categoryIds: string[]
  servings: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
  mainImageUrl?: string
}

export interface RecipeFilters {
  search?: string
  categoryId?: string
  status?: string
  sortBy?: 'created_at' | 'title' | 'likes'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalRecipes: number
  publishedRecipes: number
  draftRecipes: number
  totalLikes: number
  totalComments: number
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface FormErrors {
  [key: string]: string | undefined
}

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}