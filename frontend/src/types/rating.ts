export interface Rating {
  id: string
  dish_id: string
  user_id: string
  rating_type: number
  created_at: string
  updated_at: string
}

export interface RatingStats {
  likes: number
  total: number
  ratio: number
}

export interface SetRatingData {
  rating: number
}

export interface RatingResponse {
  success: boolean
  rating?: number
  action?: string
  error?: string
  message?: string
}

export interface RatingStatsResponse {
  success: boolean
  stats: RatingStats
  error?: string
  message?: string
}