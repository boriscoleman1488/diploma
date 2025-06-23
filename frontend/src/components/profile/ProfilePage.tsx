'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Lock, 
  LogOut,
  ChefHat,
  Settings
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfileStore } from '@/store/profileStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UpdateProfileData, ChangePasswordData } from '@/types'
import { generateProfileTag } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  profile_tag: z.string()
    .min(3, 'Profile tag must be at least 3 characters')
    .max(30, 'Profile tag must be less than 30 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Profile tag must start with a letter and contain only letters, numbers, and underscores'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const { user, logout } = useAuth()
  const { 
    profile, 
    isLoading, 
    fetchProfile, 
    updateProfile, 
    changePassword, 
    uploadAvatar 
  } = useProfileStore()

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      profile_tag: '',
    },
  })

  const passwordForm = useForm<ChangePasswordData & { confirmPassword: string }>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        profile_tag: profile.profile_tag || '',
      })
    }
  }, [profile, profileForm])

  const handleProfileSubmit = async (data: UpdateProfileData) => {
    const success = await updateProfile(data)
    if (success) {
      toast.success('Profile updated successfully')
    } else {
      toast.error('Failed to update profile')
    }
  }

  const handlePasswordSubmit = async (data: ChangePasswordData & { confirmPassword: string }) => {
    const { confirmPassword, ...passwordData } = data
    const success = await changePassword(passwordData)
    if (success) {
      toast.success('Password changed successfully')
      passwordForm.reset()
    } else {
      toast.error('Failed to change password')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const avatarUrl = await uploadAvatar(file)
      if (avatarUrl) {
        toast.success('Avatar updated successfully')
      } else {
        toast.error('Failed to upload avatar')
      }
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleGenerateTag = () => {
    const fullName = profileForm.getValues('full_name')
    if (fullName) {
      const generatedTag = generateProfileTag(fullName)
      profileForm.setValue('profile_tag', generatedTag)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="md"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || user?.fullName}
                    size="xl"
                    className="border-4 border-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {profile?.full_name || user?.fullName || 'User'}
                  </h2>
                  <p className="text-primary-100">
                    @{profile?.profile_tag || 'user'}
                  </p>
                  <p className="text-primary-100 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {profile?.email || user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Lock className="h-4 w-4 inline mr-2" />
                  Password & Security
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      required
                      error={profileForm.formState.errors.full_name?.message}
                      {...profileForm.register('full_name')}
                    />
                    
                    <div>
                      <Input
                        label="Profile Tag"
                        required
                        helperText="This will be your unique identifier (e.g., @your_tag)"
                        error={profileForm.formState.errors.profile_tag?.message}
                        {...profileForm.register('profile_tag')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateTag}
                        className="mt-2"
                      >
                        Generate from name
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                  <div className="max-w-md space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      required
                      error={passwordForm.formState.errors.currentPassword?.message}
                      {...passwordForm.register('currentPassword')}
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      required
                      error={passwordForm.formState.errors.newPassword?.message}
                      {...passwordForm.register('newPassword')}
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      required
                      error={passwordForm.formState.errors.confirmPassword?.message}
                      {...passwordForm.register('confirmPassword')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={passwordForm.formState.isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Update Password</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}