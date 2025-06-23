'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RegisterData } from '@/types'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { register: registerUser, isLoading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData & { confirmPassword: string }>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = data
      const response = await registerUser(registerData)
      
      if (response.success) {
        setRegistrationSuccess(true)
        toast.success('Account created successfully!')
        
        if (!response.requiresEmailConfirmation) {
          router.push('/auth/login')
        }
      } else {
        toast.error(response.message || 'Registration failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  if (registrationSuccess) {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Account Created Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Please check your email to verify your account before signing in.
        </p>
        <Button
          onClick={() => router.push('/auth/login')}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Go to Sign In
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        autoComplete="name"
        required
        error={errors.fullName?.message}
        {...register('fullName')}
      />

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
          autoComplete="new-password"
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

      {/* Password Requirements */}
      {password && (
        <div className="text-sm space-y-1">
          <p className="text-gray-600 font-medium">Password requirements:</p>
          <div className="space-y-1">
            <div className={`flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              At least 6 characters
            </div>
            <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              One uppercase letter
            </div>
            <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              One lowercase letter
            </div>
            <div className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              One number
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center">
        <input
          id="agree-terms"
          name="agree-terms"
          type="checkbox"
          required
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  )
}