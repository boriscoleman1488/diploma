import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

export const metadata: Metadata = {
  title: 'Login - Recipe App',
  description: 'Sign in to your Recipe App account',
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </AuthLayout>
  )
}