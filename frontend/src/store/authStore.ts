import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthStore, User, AuthSession, LoginCredentials, RegisterData, AuthResponse } from '@/types'
import { api } from '@/lib/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        set({ isLoading: true })
        
        try {
          const response = await api.login(credentials)
          
          if (response.success && response.user && response.session) {
            set({
              user: response.user,
              session: response.session,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
          
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData): Promise<AuthResponse> => {
        set({ isLoading: true })
        
        try {
          const response = await api.register(data)
          set({ isLoading: false })
          return response
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async (): Promise<void> => {
        try {
          await api.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshToken: async (): Promise<boolean> => {
        const { session } = get()
        
        if (!session?.refresh_token) {
          return false
        }

        try {
          const response = await api.refreshToken(session.refresh_token)
          
          if (response.success && response.session) {
            set({
              session: response.session,
              isAuthenticated: true,
            })
            return true
          }
          
          return false
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().clearAuth()
          return false
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setSession: (session: AuthSession | null) => {
        set({ session })
        if (session?.access_token) {
          api.setToken(session.access_token)
        }
      },

      clearAuth: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
        api.setToken(null)
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
        if (state?.session?.access_token) {
          api.setToken(state.session.access_token)
        }
      },
    }
  )
)