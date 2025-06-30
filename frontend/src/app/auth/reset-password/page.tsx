'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Check for token in various locations
    
    // 1. Check URL hash parameters (most common for Supabase)
    const hashParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
    )
    const accessToken = hashParams.get('access_token')
    
    // 2. Check URL query parameters
    const tokenFromParams = searchParams.get('token')
    
    // 3. Check for type parameter to confirm it's a recovery
    const type = hashParams.get('type') || searchParams.get('type')
    
    // Use whichever token is available
    const resetToken = accessToken || tokenFromParams || null
    
    if (resetToken) {
      console.log('Reset token found:', resetToken.substring(0, 10) + '...')
      setToken(resetToken)
    } else {
      console.error('No reset token found in URL')
      setError('Токен для скидання пароля відсутній або недійсний')
    }
  }, [searchParams])

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
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      {error || 'Токен для скидання пароля відсутній або недійсний'}
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Будь ласка, перевірте URL або запитайте новий лист для скидання пароля.
                    </p>
                  </div>
                </div>
                
                <Link href="/auth/forgot-password">
                  <Button className="w-full">
                    Запросити новий лист для скидання пароля
                  </Button>
                </Link>
                
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Повернутися до входу
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}