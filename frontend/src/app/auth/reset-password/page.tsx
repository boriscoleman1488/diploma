'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Створення нового пароля"
          subtitle="Введіть новий пароль для вашого акаунту"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Новий пароль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}