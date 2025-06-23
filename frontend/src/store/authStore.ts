import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthResponse } from '@/types'
import { api } from '@/lib/api'
import Cookies from 'js-cookie'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => Promise<void>
  verifyToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const response: AuthResponse = await api.login({ email, password })
          
          if (response.success && response.session && response.user) {
            // Store tokens in cookies
            Cookies.set('access_token', response.session.access_token, {
              expires: new Date(response.session.expires_at * 1000),
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            })
            
            Cookies.set('refresh_token', response.session.refresh_token, {
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            })
            
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            
            toast.success('Welcome back!')
            return true
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false
            })
            return false
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false
          })
          return false
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const response: AuthResponse = await api.register({ email, password, fullName })
          
          if (response.success) {
            set({ isLoading: false, error: null })
            toast.success(response.message || 'Registration successful! Please check your email.')
            return true
          } else {
            set({
              error: response.error || 'Registration failed',
              isLoading: false
            })
            return false
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false
          })
          return false
        }
      },

      logout: async () => {
        try {
          await api.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear tokens and state regardless of API call success
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
          
          toast.success('Logged out successfully')
        }
      },

      verifyToken: async () => {
        const token = Cookies.get('access_token')
        
        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
          return
        }

        try {
          set({ isLoading: true })
          
          const response = await api.verifyToken()
          
          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            // Token is invalid, clear auth state
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        } catch (error: any) {
          // Token verification failed, clear auth state
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)