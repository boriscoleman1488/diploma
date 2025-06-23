import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthLayout } from '@/components/layout/AuthLayout'

export const metadata: Metadata = {
  title: 'Register - Recipe App',
  description: 'Create your Recipe App account',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join our community of food lovers
          </p>
        </div>
        <RegisterForm />
      </div>
    </AuthLayout>
  )
}