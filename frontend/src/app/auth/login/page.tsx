'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { t } from '@/lib/translations'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email(t('messages.validEmailRequired')),
  password: z.string().min(1, t('messages.passwordRequired')),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data)
    
    if (result.success) {
      toast.success(t('messages.welcomeBack'))
      router.push('/profile')
    } else {
      // Backend error will be displayed as-is
      toast.error(result.error || t('messages.loginFailed'))
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
            {t('auth.signInToAccount')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.login')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('auth.signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}