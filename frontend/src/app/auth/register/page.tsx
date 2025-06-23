'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { t } from '@/lib/translations'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  fullName: z.string().min(2, t('messages.fullNameRequired')),
  email: z.string().email(t('messages.validEmailRequired')),
  password: z.string().min(6, t('messages.passwordTooShort')),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('messages.passwordsDontMatch'),
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isLoading } = useAuthStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data
    const result = await registerUser(registerData)
    
    if (result.success) {
      if (result.requiresEmailConfirmation) {
        toast.success(t('messages.emailConfirmationSent'))
      } else {
        toast.success(t('messages.registrationSuccessful'))
      }
      router.push('/auth/login')
    } else {
      // Backend error will be displayed as-is
      toast.error(result.error || t('messages.registrationFailed'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.createYourAccount')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.orSignInExisting')}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.register')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                {...register('fullName')}
                type="text"
                label={t('auth.fullName')}
                placeholder={t('auth.enterFullName')}
                error={errors.fullName?.message}
                leftIcon={<User className="w-4 h-4" />}
                autoComplete="name"
              />

              <Input
                {...register('email')}
                type="email"
                label={t('auth.emailAddress')}
                placeholder={t('auth.enterEmail')}
                error={errors.email?.message}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                placeholder={t('auth.enterPassword')}
                error={errors.password?.message}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                autoComplete="new-password"
              />

              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmYourPassword')}
                error={errors.confirmPassword?.message}
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
                autoComplete="new-password"
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('auth.createAccount')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}