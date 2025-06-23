import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  UpdateProfileData, 
  ChangePasswordData,
  Profile,
  ApiResponse 
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadTokenFromStorage()
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.session?.access_token) {
      this.setToken(response.session.access_token)
    }

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      })
    } finally {
      this.setToken(null)
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (response.success && response.session?.access_token) {
      this.setToken(response.session.access_token)
    }

    return response
  }

  async verifyToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/verify')
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resendConfirmation(email: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // Profile endpoints
  async getProfile(): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    return this.request<{ success: boolean; profile?: Profile; error?: string }>('/api/users/profile')
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; profile?: Profile; error?: string; message?: string }> {
    return this.request<{ success: boolean; profile?: Profile; error?: string; message?: string }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const url = `${this.baseURL}/api/users/avatar`
    const headers: HeadersInit = {}

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Avatar upload failed:', error)
      throw error
    }
  }

  async getUserByTag(tag: string): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    return this.request<{ success: boolean; profile?: Profile; error?: string }>(`/api/users/search/${tag}`)
  }
}

export const api = new ApiClient(API_BASE_URL)