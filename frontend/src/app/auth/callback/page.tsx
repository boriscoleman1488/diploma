'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyToken, refreshToken, setSession } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the access token from URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        const refreshTokenValue = hashParams.get('refresh_token') || searchParams.get('refresh_token')
        const expiresIn = hashParams.get('expires_in') || searchParams.get('expires_in')
        
        if (accessToken) {
          console.log('Access token found in URL, setting session...')
          
          // Calculate expires_at
          const expiresAt = Math.floor(Date.now() / 1000) + (parseInt(expiresIn || '3600', 10))
          
          // Set the session manually
          if (refreshTokenValue) {
            setSession({
              access_token: accessToken,
              refresh_token: refreshTokenValue,
              expires_at: expiresAt,
              expires_in: parseInt(expiresIn || '3600', 10),
              token_type: 'bearer'
            })
          }
          
          // Verify the token
          const isValid = await verifyToken()
          
          if (isValid) {
            setStatus('success')
            setMessage('Електронну пошту успішно підтверджено!')
            toast.success('Електронну пошту підтверджено! Перенаправлення...')
            
            // Redirect to profile after a short delay
            setTimeout(() => {
              router.push('/profile')
            }, 2000)
          } else {
            throw new Error('Не вдалося підтвердити токен')
          }
        } else {
          // Check for error in URL
          const error = hashParams.get('error') || searchParams.get('error')
          const errorDescription = hashParams.get('error_description') || searchParams.get('error_description')
          
          if (error) {
            throw new Error(errorDescription || error)
          } else {
            throw new Error('Відсутній токен доступу')
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Помилка підтвердження')
        toast.error('Помилка підтвердження електронної пошти')
      }
    }

    handleAuthCallback()
  }, [router, searchParams, verifyToken, refreshToken, setSession])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Підтвердження електронної пошти...
              </h2>
              <p className="text-gray-600">
                Будь ласка, зачекайте, поки ми підтверджуємо вашу електронну пошту.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Успішно підтверджено!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Перенаправлення до вашого профілю...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Помилка підтвердження
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Спробуйте увійти в систему або зв'яжіться з підтримкою, якщо проблема не зникає.
                </p>
                <Link href="/auth/login">
                  <Button className="w-full">
                    Перейти до сторінки входу
                  </Button>
                </Link>
                <Link href="/auth/resend-confirmation">
                  <Button variant="outline" className="w-full">
                    Надіслати лист підтвердження повторно
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}