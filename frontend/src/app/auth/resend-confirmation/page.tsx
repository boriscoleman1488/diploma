'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ResendConfirmationForm } from '@/components/auth/ResendConfirmationForm'
import { Mail } from 'lucide-react'

export default function ResendConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Повторна відправка підтвердження"
          subtitle="Введіть вашу електронну пошту для повторної відправки листа підтвердження"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Підтвердження електронної пошти
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResendConfirmationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}