export interface User {
  id: string
  email: string
  fullName?: string
  emailConfirmed: boolean
  lastSignIn?: string
  metadata?: Record<string, any>
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

export interface AuthState {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  verifyToken: () => Promise<boolean>
  setUser: (user: User | null) => void
  setSession: (session: AuthSession | null) => void
}