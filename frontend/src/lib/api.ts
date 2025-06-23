import { AuthSession } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

class ApiClient {
  private baseURL: string
  private session: AuthSession | null = null

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Помилка мережі',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }))
      
      // Use backend error message if available, otherwise use fallback
      const errorMessage = errorData.message || errorData.error || 'Невідома помилка'
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    // If the response contains an error (even with 200 status), throw it
    if (!data.success && data.error) {
      throw new Error(data.message || data.error)
    }

    return data
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(false), // Don't include Content-Type for GET
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const headers = this.getAuthHeaders(!!data) // Only include Content-Type if there's data
      const body = data ? JSON.stringify(data) : undefined

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const headers = this.getAuthHeaders(!!data) // Only include Content-Type if there's data
      const body = data ? JSON.stringify(data) : undefined

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(false), // Don't include Content-Type for DELETE without body
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const headers: HeadersInit = {}
      if (this.session?.access_token) {
        headers.Authorization = `Bearer ${this.session.access_token}`
      }
      // Don't set Content-Type for FormData - browser will set it with boundary

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Помилка мережі')
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)