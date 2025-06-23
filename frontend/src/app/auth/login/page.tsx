import { Metadata } from 'next'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Recipe App account',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/auth/register"
    >
      <LoginForm />
    </AuthLayout>
  )
}