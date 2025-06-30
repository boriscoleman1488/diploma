'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { RegistrationHelp } from '@/components/auth/RegistrationHelp'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Створіть ваш акаунт"
          subtitle="Або"
          linkText="увійдіть до існуючого акаунту"
          linkHref="/auth/login"
        />

        <Card>
          <CardHeader>
            <CardTitle>Реєстрація</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        <RegistrationHelp />
      </div>
    </div>
  )
}