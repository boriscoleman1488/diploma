'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoginCredentials } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const response = await login(data)
      
      if (response.success) {
        toast.success('Welcome back!')
        router.push('/profile')
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        Sign in
      </Button>
    </form>
  )
}