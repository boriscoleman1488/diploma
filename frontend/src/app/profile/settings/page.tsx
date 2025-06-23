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
  full_name: z.string().min(2, 'Повне ім\'я повинно містити принаймні 2 символи').optional(),
  profile_tag: z.string()
    .min(3, 'Тег профілю повинен містити принаймні 3 символи')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Тег профілю повинен починатися з літери і містити лише літери, цифри та підкреслення')
    .optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Поточний пароль обов\'язковий'),
  newPassword: z.string().min(6, 'Новий пароль повинен містити принаймні 6 символів'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Паролі не співпадають",
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
      // Backend error will be displayed as-is
      toast.error(result.error || 'Не вдалося оновити профіль')
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
      toast.error('Будь ласка, оберіть дійсний файл зображення (JPG, PNG або WebP)')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const compressedFile = await compressImage(file)
      const result = await uploadAvatar(compressedFile)
      if (!result.success) {
        // Backend error will be displayed as-is
        toast.error(result.error || 'Не вдалося завантажити аватар')
      }
    } catch (error) {
      toast.error('Не вдалося обробити зображення')
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
          <p className="mt-4 text-gray-600">Завантаження налаштувань...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Профіль не знайдено</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Налаштування профілю</h1>
        <p className="mt-1 text-sm text-gray-600">
          Керуйте налаштуваннями вашого акаунту та вподобаннями
        </p>
      </div>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            Фото профілю
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
                    {isUploadingAvatar ? 'Завантаження...' : 'Змінити аватар'}
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
                JPG, PNG або WebP. Максимальний розмір 2МБ.
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
            Інформація профілю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <Input
              {...profileForm.register('full_name')}
              label="Повне ім'я"
              placeholder="Введіть ваше повне ім'я"
              error={profileForm.formState.errors.full_name?.message}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              {...profileForm.register('profile_tag')}
              label="Тег профілю"
              placeholder="Введіть ваш тег профілю"
              error={profileForm.formState.errors.profile_tag?.message}
              helperText="Це буде ваш унікальний ідентифікатор (наприклад, @ваш_тег)"
              leftIcon={<span className="text-gray-400">@</span>}
            />

            <Input
              value={profile.email}
              label="Адреса електронної пошти"
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Електронну пошту не можна змінити. Зверніться до підтримки, якщо потрібно."
            />

            <Button
              type="submit"
              isLoading={isUpdating}
              disabled={isUpdating}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Зберегти зміни
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Змінити пароль
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            <Input
              {...passwordForm.register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              label="Поточний пароль"
              placeholder="Введіть ваш поточний пароль"
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
              label="Новий пароль"
              placeholder="Введіть ваш новий пароль"
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
              label="Підтвердіть новий пароль"
              placeholder="Підтвердіть ваш новий пароль"
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
              Змінити пароль
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}