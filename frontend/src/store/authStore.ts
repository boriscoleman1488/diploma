import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User, AuthSession, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth'
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

      login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/auth/login', credentials)
          
          if (response.success && response.user && response.session) {
            set({ 
              user: response.user, 
              session: response.session, 
              isAuthenticated: true,
              isLoading: false 
            })
            apiClient.setSession(response.session)
            
            // Fetch user profile to get avatar and other details
            try {
              const profileResponse = await apiClient.get('/users/profile')
              if (profileResponse.success && profileResponse.profile) {
                set(state => ({
                  user: state.user ? {
                    ...state.user,
                    fullName: profileResponse.profile.full_name,
                    metadata: {
                      ...state.user.metadata,
                      avatar_url: profileResponse.profile.avatar_url,
                      profile_tag: profileResponse.profile.profile_tag
                    }
                  } : null
                }))
              }
            } catch (profileError) {
              console.error('Failed to fetch profile after login:', profileError)
            }
            
            return response
          }
          
          set({ isLoading: false })
          return response
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed'
          }
        }
      },

      register: async (data: RegisterData): Promise<AuthResponse> => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post('/auth/register', data)
          set({ isLoading: false })
          return response
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Registration failed'
          }
        }
      },

      logout: async (): Promise<void> => {
        set({ isLoading: true })
        try {
          // Try to logout on server, but don't wait for it
          apiClient.post('/auth/logout').catch(() => {
            // Ignore logout errors - we're clearing local state anyway
          })
        } catch (error) {
          // Ignore logout errors
        } finally {
          // Always clear local state
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
          apiClient.setSession(null)
          
          // Clear localStorage
          localStorage.removeItem('auth-storage')
          
          // Redirect to login
          window.location.href = '/auth/login'
        }
      },

      refreshToken: async (): Promise<boolean> => {
        const { session } = get()
        if (!session?.refresh_token) {
          return false
        }

        try {
          const response = await apiClient.post('/auth/refresh', {
            refresh_token: session.refresh_token
          })

          if (response.success && response.session) {
            set({ session: response.session })
            apiClient.setSession(response.session)
            return true
          }
          
          // Refresh failed, logout user
          get().logout()
          return false
        } catch (error) {
          console.error('Token refresh failed:', error)
          // Refresh failed, logout user
          get().logout()
          return false
        }
      },

      verifyToken: async (): Promise<boolean> => {
        const { session } = get()
        if (!session?.access_token) {
          return false
        }

        // Check if token is expired or will expire soon (within 5 minutes)
        const now = Date.now() / 1000
        const expiresAt = session.expires_at
        const fiveMinutes = 5 * 60

        if (expiresAt && (expiresAt - now) < fiveMinutes) {
          console.log('Token expires soon, refreshing...')
          return await get().refreshToken()
        }

        try {
          const response = await apiClient.get('/auth/verify')
          
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true 
            })
            
            // Fetch user profile to get avatar and other details
            try {
              const profileResponse = await apiClient.get('/users/profile')
              if (profileResponse.success && profileResponse.profile) {
                set(state => ({
                  user: state.user ? {
                    ...state.user,
                    fullName: profileResponse.profile.full_name,
                    metadata: {
                      ...state.user.metadata,
                      avatar_url: profileResponse.profile.avatar_url,
                      profile_tag: profileResponse.profile.profile_tag
                    }
                  } : null
                }))
              }
            } catch (profileError) {
              console.error('Failed to fetch profile after token verification:', profileError)
            }
            
            return true
          }
          
          // Token is invalid, try to refresh
          return await get().refreshToken()
        } catch (error) {
          console.error('Token verification failed:', error)
          
          // If verification fails, try to refresh token
          if (session?.refresh_token) {
            return await get().refreshToken()
          }
          
          // No refresh token available, logout
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
    }
  )
)