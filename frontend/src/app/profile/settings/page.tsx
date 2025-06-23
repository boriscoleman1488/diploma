'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  User, 
  Mail, 
  Camera, 
  Save, 
  Lock,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { isValidImageFile, compressImage } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  profile_tag: z.string()
    .min(3, 'Profile tag must be at least 3 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Profile tag must start with a letter and contain only letters, numbers, and underscores')
    .optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const { 
    profile, 
    isLoading, 
    isUpdating, 
    updateProfile, 
    changePassword, 
    uploadAvatar 
  } = useProfile()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      profile_tag: profile?.profile_tag || '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Update form when profile loads
  useState(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        profile_tag: profile.profile_tag || '',
      })
    }
  }, [profile, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    const result = await updateProfile(data)
    if (!result.success) {
      toast.error(result.error || 'Failed to update profile')
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    const { confirmPassword, ...passwordData } = data
    const result = await changePassword(passwordData)
    if (result.success) {
      passwordForm.reset()
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!isValidImageFile(file)) {
      toast.error('Please select a valid image file (JPG, PNG, or WebP)')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const compressedFile = await compressImage(file)
      const result = await uploadAvatar(compressedFile)
      if (!result.success) {
        toast.error(result.error || 'Failed to upload avatar')
      }
    } catch (error) {
      toast.error('Failed to process image')
    } finally {
      setIsUploadingAvatar(false)
      // Reset the input
      event.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name || profile.email}
              size="xl"
            />
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Button
                  variant="outline"
                  leftIcon={isUploadingAvatar ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
                  disabled={isUploadingAvatar}
                  asChild
                >
                  <span>
                    {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                  </span>
                </Button>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG or WebP. Max size 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <Input
              {...profileForm.register('full_name')}
              label="Full Name"
              placeholder="Enter your full name"
              error={profileForm.formState.errors.full_name?.message}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              {...profileForm.register('profile_tag')}
              label="Profile Tag"
              placeholder="Enter your profile tag"
              error={profileForm.formState.errors.profile_tag?.message}
              helperText="This will be your unique identifier (e.g., @your_tag)"
              leftIcon={<span className="text-gray-400">@</span>}
            />

            <Input
              value={profile.email}
              label="Email Address"
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Email cannot be changed. Contact support if needed."
            />

            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={isUpdating}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            <Input
              {...passwordForm.register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              placeholder="Enter your current password"
              error={passwordForm.formState.errors.currentPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              {...passwordForm.register('newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="Enter your new password"
              error={passwordForm.formState.errors.newPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              {...passwordForm.register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              placeholder="Confirm your new password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={isUpdating}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}