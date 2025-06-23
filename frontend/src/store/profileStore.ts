import { create } from 'zustand'
import { ProfileStore, Profile, UpdateProfileData, ChangePasswordData } from '@/types'
import { api } from '@/lib/api'

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async (): Promise<void> => {
    set({ isLoading: true })
    
    try {
      const response = await api.getProfile()
      
      if (response.success && response.profile) {
        set({ profile: response.profile })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<boolean> => {
    set({ isLoading: true })
    
    try {
      const response = await api.updateProfile(data)
      
      if (response.success && response.profile) {
        set({ profile: response.profile })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<boolean> => {
    try {
      const response = await api.changePassword(data)
      return response.success
    } catch (error) {
      console.error('Failed to change password:', error)
      return false
    }
  },

  uploadAvatar: async (file: File): Promise<string | null> => {
    try {
      const response = await api.uploadAvatar(file)
      
      if (response.success && response.avatarUrl) {
        const { profile } = get()
        if (profile) {
          set({
            profile: {
              ...profile,
              avatar_url: response.avatarUrl,
            },
          })
        }
        return response.avatarUrl
      }
      
      return null
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      return null
    }
  },

  setProfile: (profile: Profile | null) => {
    set({ profile })
  },
}))