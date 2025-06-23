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
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Будь ласка, введіть дійсну адресу електронної пошти'),
  password: z.string().min(1, 'Пароль обов\'язковий'),
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
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data)
    
    if (result.success) {
      toast.success('З поверненням!')
      router.push('/profile')
    } else {
      // Show specific error message for email confirmation
      if (result.error === 'Email not confirmed' || result.message?.includes('підтвердіть')) {
        toast.error(result.message || 'Будь ласка, підтвердіть свою електронну пошту перед входом')
        // Show additional help
        setTimeout(() => {
          toast('Не отримали лист? Перевірте папку "Спам" або надішліть повторно', {
            icon: '📧',
            duration: 5000
          })
        }, 1000)
      } else {
        toast.error(result.message || result.error || 'Помилка входу')
      }
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
            Увійдіть до вашого акаунту
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Або{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              створіть новий акаунт
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вхід</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                {...register('email')}
                type="email"
                label="Адреса електронної пошти"
                placeholder="Введіть вашу електронну пошту"
                error={errors.email?.message}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Пароль"
                placeholder="Введіть ваш пароль"
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
                    Забули пароль?
                  </Link>
                </div>
                <div className="text-sm">
                  <Link
                    href="/auth/resend-confirmation"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Повторити підтвердження
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Увійти
              </Button>
            </form>

            {/* Email confirmation help */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Проблеми з входом?</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Переконайтеся, що ви підтвердили електронну пошту</li>
                <li>• Перевірте папку "Спам" для листа підтвердження</li>
                <li>• Переконайтеся, що пароль введено правильно</li>
                <li>• <Link href="/auth/resend-confirmation" className="underline">Надіслати лист підтвердження повторно</Link></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}