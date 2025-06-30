import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Повне ім\'я повинно містити принаймні 2 символи'),
  email: z.string().email('Будь ласка, введіть дійсну адресу електронної пошти'),
  password: z.string().min(6, 'Пароль повинен містити принаймні 6 символів'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  redirectTo?: string
}

export function RegisterForm({ redirectTo = '/auth/login' }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, isLoading } = useAuth()
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
      router.push(redirectTo)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register('fullName')}
        type="text"
        label="Повне ім'я"
        placeholder="Введіть ваше повне ім'я"
        error={errors.fullName?.message}
        leftIcon={<User className="w-4 h-4" />}
        autoComplete="name"
      />

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
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        label="Підтвердіть пароль"
        placeholder="Підтвердіть ваш пароль"
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
        Створити акаунт
      </Button>
    </form>
  )
}