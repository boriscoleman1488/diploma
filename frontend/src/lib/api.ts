import { AuthSession } from '@/types/auth'

// Use the backend URL for API requests
const API_BASE_URL = 'http://localhost:3000/api'

class ApiClient {
  private baseURL: string
  private session: AuthSession | null = null
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    
    // Only restore session on client side
    if (typeof window !== 'undefined') {
      this.restoreSession()
    }
  }

  // Restore session from localStorage if available
  private restoreSession() {
    try {
      if (typeof window === 'undefined') return
      
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsedStorage = JSON.parse(authStorage)
        if (parsedStorage.state && parsedStorage.state.session) {
          this.session = parsedStorage.state.session
          console.log('Session restored from localStorage', {
            tokenLength: this.session.access_token.length,
            expiresAt: new Date(this.session.expires_at * 1000).toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Failed to restore session from localStorage:', error)
    }
  }

  setSession(session: AuthSession | null) {
    this.session = session
    
    // Log session state for debugging
    if (session) {
      console.log('Session set in ApiClient', { 
        tokenLength: session.access_token.length,
        expiresAt: new Date(session.expires_at * 1000).toISOString()
      })
    } else {
      console.log('Session cleared in ApiClient')
    }
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

  private isAuthEndpoint(endpoint: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
      '/auth/resend-confirmation',
      '/auth/reset-password',
      '/auth/confirm',
      '/auth/verify'
    ]
    
    return authEndpoints.some(authEndpoint => endpoint.startsWith(authEndpoint))
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
      console.log('Performing token refresh...')
      // Add error handling with timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.session?.refresh_token
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('Token refresh failed: Response not OK', { status: response.status })
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      if (data.success && data.session) {
        console.log('Token refresh successful, updating session')
        this.session = data.session
        
        // Update the auth store
        const { useAuthStore } = await import('@/store/authStore')
        useAuthStore.getState().setSession(data.session)
        
        return true
      }
      
      console.log('Token refresh failed: Invalid response data', { data })
      throw new Error('Invalid refresh response')
    } catch (error) {
      console.error('Token refresh error:', error)
      
      // Refresh failed, logout user
      const { useAuthStore } = await import('@/store/authStore')
      useAuthStore.getState().logout()
      
      return false
    }
  }

  private isNotFoundError(errorMessage: string): boolean {
    const notFoundIndicators = [
      'not found',
      'unable to fetch dish',
      'страву не знайдено',
      'dish not found'
    ]
    
    return notFoundIndicators.some(indicator => 
      errorMessage.toLowerCase().includes(indicator.toLowerCase())
    )
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
      
      // Don't refresh tokens for auth endpoints
      if (!this.isAuthEndpoint(endpoint)) {
        // Refresh token if needed before making the request
        await this.refreshTokenIfNeeded()
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const requestOptions = {
        ...options,
        signal: controller.signal
      };
      
      const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
      
      clearTimeout(timeoutId);
      
      return await this.handleResponse<T>(response)
    } catch (error) {
      // If token was refreshed, retry the request once (but not for auth endpoints)
      if (error instanceof Error && 
          error.message === 'TOKEN_REFRESHED' && 
          retryCount === 0 && 
          !this.isAuthEndpoint(endpoint)) {
        console.log('Token refreshed, retrying request...')
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            ...this.getAuthHeaders(!!options.body)
          }
        }
        return this.makeRequest<T>(endpoint, newOptions, retryCount + 1)
      }
      
      if (error instanceof Error) {
        // Don't log TOKEN_REFRESHED errors for auth endpoints
        if (error.message === 'TOKEN_REFRESHED' && this.isAuthEndpoint(endpoint)) {
          // For auth endpoints, treat TOKEN_REFRESHED as a regular auth error
          throw new Error('Помилка автентифікації')
        }
        
        // Handle AbortError (timeout) specially
        if (error.name === 'AbortError') {
          console.error(`API Request timeout (${options.method} ${endpoint})`)
          throw new Error('Запит перервано через таймаут. Перевірте з\'єднання з сервером.')
        }
        
        // Use console.warn for expected "not found" scenarios instead of console.error
        if (this.isNotFoundError(error.message)) {
          console.warn(`API Warning (${options.method} ${endpoint}):`, error.message)
        } else {
          console.error(`API Error (${options.method} ${endpoint}):`, error.message)
        }
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