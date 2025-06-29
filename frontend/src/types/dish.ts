export interface Dish {
  id: string
  title: string
  description: string
  servings: number
  main_image_url?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  user_id: string
  moderated_at?: string
  rejection_reason?: string
  
  // Relations
  ingredients?: DishIngredient[]
  steps?: DishStep[]
  categories?: DishCategory[]
  ratings?: DishRating[]
  comments_count?: number
  
  // User info
  profiles?: {
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
  
  // Nutrition info
  nutrition?: {
    calories: number
    caloriesPerServing: number
    totalWeight: number
    servings: number
    macros: {
      protein: { quantity: number; unit: string }
      fat: { quantity: number; unit: string }
      carbs: { quantity: number; unit: string }
      fiber: { quantity: number; unit: string }
      sugar: { quantity: number; unit: string }
      sodium: { quantity: number; unit: string }
    }
    macrosPerServing?: {
      protein: { quantity: number; unit: string }
      fat: { quantity: number; unit: string }
      carbs: { quantity: number; unit: string }
      fiber: { quantity: number; unit: string }
      sugar: { quantity: number; unit: string }
      sodium: { quantity: number; unit: string }
    }
    dietLabels: string[]
    healthLabels: string[]
    cautions: string[]
  }
}

export interface DishIngredient {
  id?: string
  dish_id?: string
  name: string
  amount: number
  unit: string
  edamam_food_id?: string
  order_index?: number
}

export interface DishStep {
  id?: string
  dish_id?: string
  step_number?: number
  description: string
  image_url?: string
  duration_minutes?: number
  created_at?: string
}

export interface DishCategory {
  id: string
  name: string
}

export interface DishRating {
  rating_type: number
}

export interface CreateDishData {
  title: string
  description: string
  servings: number
  category_ids?: string[]
  ingredients: {
    name: string
    amount: number
    unit: string
    edamam_food_id?: string
  }[]
  steps: {
    description: string
    duration_minutes?: number
    image_url?: string
  }[]
  main_image_url?: string
  nutrition?: any
}

export interface UpdateDishData extends Partial<CreateDishData> {}

export interface DishResponse {
  success: boolean
  dish?: Dish
  error?: string
  message?: string
}

export interface DishesResponse {
  success: boolean
  dishes: Dish[]
  total: number
  error?: string
  message?: string
}

export interface DishStats {
  total: number
  approved: number
  pending: number
  rejected: number
  draft: number
}

// Edamam API types
export interface EdamamFood {
  foodId: string
  label: string
  category?: string
  image?: string
  nutrients?: {
    ENERC_KCAL?: number
    PROCNT?: number
    FAT?: number
    CHOCDF?: number
  }
}

export interface EdamamSearchResponse {
  success: boolean
  foods: EdamamFood[]
  query: string
  error?: string
}

export interface EdamamFoodDetailsResponse {
  success: boolean
  nutrients?: any
  calories?: number
  weight?: number
  error?: string
}

export interface NutritionAnalysisResponse {
  success: boolean
  nutrition?: {
    calories: number
    caloriesPerServing: number
    totalWeight: number
    servings: number
    macros: {
      protein: { quantity: number; unit: string }
      fat: { quantity: number; unit: string }
      carbs: { quantity: number; unit: string }
      fiber: { quantity: number; unit: string }
      sugar: { quantity: number; unit: string }
      sodium: { quantity: number; unit: string }
    }
    macrosPerServing?: {
      protein: { quantity: number; unit: string }
      fat: { quantity: number; unit: string }
      carbs: { quantity: number; unit: string }
      fiber: { quantity: number; unit: string }
      sugar: { quantity: number; unit: string }
      sodium: { quantity: number; unit: string }
    }
    dietLabels: string[]
    healthLabels: string[]
    cautions: string[]
  }
  error?: string
  message?: string
}