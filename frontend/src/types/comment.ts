export interface Comment {
  id: string
  dish_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  profiles: {
    full_name?: string
    email: string
    profile_tag?: string
    avatar_url?: string
  }
}

export interface CreateCommentData {
  content: string
}

export interface UpdateCommentData {
  content: string
}

export interface CommentResponse {
  success: boolean
  comment?: Comment
  error?: string
  message?: string
}

export interface CommentsResponse {
  success: boolean
  comments: Comment[]
  total: number
  error?: string
  message?: string
}

export interface CommentStats {
  total: number
  active: number
  deleted: number
}