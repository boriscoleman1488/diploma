'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoginForm } from '@/components/auth/LoginForm'
import { EmailConfirmationHelp } from '@/components/auth/EmailConfirmationHelp'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Увійдіть до вашого акаунту"
          subtitle="Або"
          linkText="створіть новий акаунт"
          linkHref="/auth/register"
        />

        <Card>
          <CardHeader>
            <CardTitle>Вхід</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo="/profile" />
            <EmailConfirmationHelp />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}