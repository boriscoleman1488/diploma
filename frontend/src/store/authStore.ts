import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, LoginCredentials, RegisterData, User, AuthSession } from '@/types/auth'
import { apiClient } from '@/lib/api'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setSession: (session: AuthSession | null) => {
        set({ session })
        apiClient.setSession(session)
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/auth/login', credentials)
          
          if (response.success && response.user && response.session) {
            set({
              user: response.user,
              session: response.session,
              isAuthenticated: true,
              isLoading: false,
            })
            apiClient.setSession(response.session)
          }
          
          return response
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Помилка входу',
          }
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/auth/register', data)
          set({ isLoading: false })
          return response
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Помилка реєстрації',
          }
        }
      },

      logout: async () => {
        try {
          // Don't send body for logout - just call the endpoint
          await apiClient.post('/auth/logout', undefined)
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          })
          apiClient.setSession(null)
        }
      },

      refreshToken: async () => {
        const { session } = get()
        if (!session?.refresh_token) return false

        try {
          const response = await apiClient.post('/auth/refresh', {
            refresh_token: session.refresh_token,
          })

          if (response.success && response.session) {
            set({ session: response.session })
            apiClient.setSession(response.session)
            return true
          }
          return false
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().logout()
          return false
        }
      },

      verifyToken: async () => {
        const { session } = get()
        if (!session?.access_token) return false

        try {
          const response = await apiClient.get('/auth/verify')
          
          if (response.success && response.user) {
            set({ user: response.user, isAuthenticated: true })
            return true
          }
          return false
        } catch (error) {
          console.error('Token verification failed:', error)
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.session) {
          apiClient.setSession(state.session)
        }
      },
    }
  )
)