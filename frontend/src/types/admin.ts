export interface AdminUser {
  id: string
  email: string
  full_name?: string
  profile_tag?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface AdminUserDetails extends AdminUser {
  last_sign_in_at?: string
  email_confirmed_at?: string
  user_metadata?: Record<string, any>
}

export interface AdminUsersResponse {
  success: boolean
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export interface AdminUserDetailsResponse {
  success: boolean
  user?: AdminUserDetails
  error?: string
}

export interface UpdateUserRoleData {
  role: 'user' | 'admin'
}

export interface AdminStats {
  totalUsers: number
  roleDistribution: {
    user: number
    admin: number
  }
  generatedAt: string
}