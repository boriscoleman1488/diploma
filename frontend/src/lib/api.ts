import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/auth/login'
        }

        // Show error toast for non-401 errors
        if (error.response?.status !== 401) {
          const message = error.response?.data?.message || 'An error occurred'
          toast.error(message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', credentials)
    return response.data
  }

  async register(credentials: { email: string; password: string; fullName: string }) {
    const response = await this.client.post('/auth/register', credentials)
    return response.data
  }

  async logout() {
    const response = await this.client.post('/auth/logout')
    return response.data
  }

  async verifyToken() {
    const response = await this.client.get('/auth/verify')
    return response.data
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  }

  // User endpoints
  async getProfile() {
    const response = await this.client.get('/users/profile')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/profile', data)
    return response.data
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await this.client.put('/users/password', data)
    return response.data
  }

  // Recipe endpoints
  async getRecipes(filters?: any) {
    const params = new URLSearchParams()
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
    }
    const response = await this.client.get(`/dishes?${params.toString()}`)
    return response.data
  }

  async getRecipe(id: string) {
    const response = await this.client.get(`/dishes/${id}`)
    return response.data
  }

  async createRecipe(data: any) {
    const response = await this.client.post('/dishes', data)
    return response.data
  }

  async updateRecipe(id: string, data: any) {
    const response = await this.client.put(`/dishes/${id}`, data)
    return response.data
  }

  async deleteRecipe(id: string) {
    const response = await this.client.delete(`/dishes/${id}`)
    return response.data
  }

  async updateRecipeStatus(id: string, action: string) {
    const response = await this.client.patch(`/dishes/${id}/status`, { action })
    return response.data
  }

  // Category endpoints
  async getCategories() {
    const response = await this.client.get('/categories')
    return response.data
  }

  async getCategory(id: string) {
    const response = await this.client.get(`/categories/${id}`)
    return response.data
  }

  async createCategory(data: { name: string; description?: string }) {
    const response = await this.client.post('/categories', data)
    return response.data
  }

  // Rating endpoints
  async getRatingStats(dishId: string) {
    const response = await this.client.get(`/ratings/${dishId}`)
    return response.data
  }

  async setRating(dishId: string, rating: number) {
    const response = await this.client.post(`/ratings/${dishId}`, { rating })
    return response.data
  }

  async getUserRating(dishId: string) {
    const response = await this.client.get(`/ratings/dishes/${dishId}/my-rating`)
    return response.data
  }

  async removeRating(dishId: string) {
    const response = await this.client.delete(`/ratings/${dishId}`)
    return response.data
  }

  // Comment endpoints
  async getComments(dishId: string, page = 1, limit = 20) {
    const response = await this.client.get(`/comments/${dishId}?page=${page}&limit=${limit}`)
    return response.data
  }

  async createComment(dishId: string, content: string) {
    const response = await this.client.post(`/comments/${dishId}`, { content })
    return response.data
  }

  async updateComment(commentId: string, content: string) {
    const response = await this.client.put(`/comments/${commentId}`, { content })
    return response.data
  }

  async deleteComment(commentId: string) {
    const response = await this.client.delete(`/comments/${commentId}`)
    return response.data
  }

  // Collection endpoints
  async getCollections() {
    const response = await this.client.get('/collections')
    return response.data
  }

  async getDishesByType(type: string) {
    const response = await this.client.get(`/collections/type/${type}`)
    return response.data
  }

  async createCollection(data: { name: string; description?: string }) {
    const response = await this.client.post('/collections', data)
    return response.data
  }

  async addDishToCollection(collectionId: string, dishId: string) {
    const response = await this.client.post(`/collections/dishes/${collectionId}`, { dishId })
    return response.data
  }

  async removeDishFromCollection(collectionId: string, dishId: string) {
    const response = await this.client.delete(`/collections/${collectionId}/dishes/${dishId}`)
    return response.data
  }

  async deleteCollection(collectionId: string) {
    const response = await this.client.delete(`/collections/${collectionId}`)
    return response.data
  }
}

export const api = new ApiClient()