import { Metadata } from 'next'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Recipe App account',
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our community of food lovers"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/login"
    >
      <RegisterForm />
    </AuthLayout>
  )
}