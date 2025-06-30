import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Будь ласка, введіть дійсну адресу електронної пошти'),
  password: z.string().min(1, 'Пароль обов\'язковий'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  redirectTo?: string
}

export function LoginForm({ redirectTo = '/profile' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
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
      router.push(redirectTo)
    }
  }

  return (
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
  )
}