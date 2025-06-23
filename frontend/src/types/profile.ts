export interface Profile {
  id: string
  email: string
  full_name?: string
  profile_tag?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  full_name?: string
  profile_tag?: string
  avatar_url?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ProfileStats {
  recipesCreated: number
  favoriteRecipes: number
  lastLogin: string
  emailConfirmed: boolean
}

export interface ProfileResponse {
  success: boolean
  profile?: Profile
  error?: string
  message?: string
}

export interface ProfileStatsResponse {
  success: boolean
  stats?: ProfileStats
  error?: string
  message?: string
}