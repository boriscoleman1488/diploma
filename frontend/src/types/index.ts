// User and Authentication Types
export interface User {
  id: string
  email: string
  fullName?: string
  emailConfirmed: boolean
  lastSignIn?: string
  metadata?: Record<string, any>
}

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

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  expires_in: number
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
  session?: AuthSession
  error?: string
  requiresEmailConfirmation?: boolean
}

// Profile Types
export interface UpdateProfileData {
  full_name?: string
  profile_tag?: string
  avatar_url?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total?: number
  page?: number
  limit?: number
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'file'
  placeholder?: string
  required?: boolean
  validation?: Record<string, any>
}

// UI Component Types
export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

export interface InputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  className?: string
}

// Store Types
export interface AuthStore {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  setUser: (user: User | null) => void
  setSession: (session: AuthSession | null) => void
  clearAuth: () => void
}

export interface ProfileStore {
  profile: Profile | null
  isLoading: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<boolean>
  changePassword: (data: ChangePasswordData) => Promise<boolean>
  uploadAvatar: (file: File) => Promise<string | null>
  setProfile: (profile: Profile | null) => void
}