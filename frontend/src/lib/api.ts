import { AuthSession } from '@/types/auth'

// Use Next.js proxy for all environments to avoid CORS issues
const API_BASE_URL = '/api'

class ApiClient {
  private baseURL: string
  private session: AuthSession | null = null
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setSession(session: AuthSession | null) {
    this.session = session
  }

  private getAuthHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: HeadersInit = {}

    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.session?.access_token) {
      headers.Authorization = `Bearer ${this.session.access_token}`
    }

    return headers
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.session?.refresh_token) {
      return false
    }

    // Check if token is expired or will expire soon (within 5 minutes)
    const now = Date.now() / 1000
    const expiresAt = this.session.expires_at
    const fiveMinutes = 5 * 60

    if (!expiresAt || (expiresAt - now) >= fiveMinutes) {
      return true // Token is still valid
    }

    // If already refreshing, wait for the existing refresh
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise
    }

    // Start refresh process
    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.session?.refresh_token
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      if (data.success && data.session) {
        this.session = data.session
        
        // Update the auth store
        const { useAuthStore } = await import('@/store/authStore')
        useAuthStore.getState().setSession(data.session)
        
        return true
      }
      
      throw new Error('Invalid refresh response')
    } catch (error) {
      console.error('Token refresh error:', error)
      
      // Refresh failed, logout user
      const { useAuthStore } = await import('@/store/authStore')
      useAuthStore.getState().logout()
      
      return false
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 errors specially
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshTokenIfNeeded()
        if (!refreshed) {
          throw new Error('Будь ласка, увійдіть в систему знову')
        }
        // If refresh succeeded, the original request should be retried by the caller
        throw new Error('TOKEN_REFRESHED')
      }

      const errorData = await response.json().catch(() => ({
        error: 'Помилка мережі',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))
      
      const errorMessage = errorData.message || errorData.error || 'Невідома помилка'
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    if (!data.success && data.error) {
      throw new Error(data.message || data.error)
    }

    return data
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    try {
      // Log the request for debugging
      console.log(`API Request: ${options.method} ${this.baseURL}${endpoint}`)
      
      // Refresh token if needed before making the request
      await this.refreshTokenIfNeeded()

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        // Remove mode and credentials for same-origin requests
        credentials: 'same-origin'
      })
      return await this.handleResponse<T>(response)
    } catch (error) {
      // If token was refreshed, retry the request once
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retryCount === 0) {
        console.log('Token refreshed, retrying request...')
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            ...this.getAuthHeaders(!!options.body)
          },
          credentials: 'same-origin' as RequestCredentials
        }
        return this.makeRequest<T>(endpoint, newOptions, retryCount + 1)
      }
      
      if (error instanceof Error) {
        console.error(`API Error (${options.method} ${endpoint}):`, error.message)
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(false),
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = this.getAuthHeaders(!!data)
    const body = data ? JSON.stringify(data) : undefined

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      headers,
      body,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = this.getAuthHeaders(!!data)
    const body = data ? JSON.stringify(data) : undefined

    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      headers,
      body,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const headers = this.getAuthHeaders(!!data)
    const body = data ? JSON.stringify(data) : undefined

    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      headers,
      body,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      headers: this.getAuthHeaders(false),
    })
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const headers: HeadersInit = {}
    if (this.session?.access_token) {
      headers.Authorization = `Bearer ${this.session.access_token}`
    }

    const formData = new FormData()
    formData.append('file', file)

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)