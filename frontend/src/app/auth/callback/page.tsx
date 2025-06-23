'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyToken } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the access token from URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        
        if (accessToken) {
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
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, verifyToken])

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
              <p className="text-sm text-gray-500">
                Перенаправлення до сторінки входу...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}