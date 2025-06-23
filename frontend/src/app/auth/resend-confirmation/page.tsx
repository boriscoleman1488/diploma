'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

const resendSchema = z.object({
  email: z.string().email('Будь ласка, введіть дійсну адресу електронної пошти'),
})

type ResendFormData = z.infer<typeof resendSchema>

export default function ResendConfirmationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
  })

  const onSubmit = async (data: ResendFormData) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/resend-confirmation', data)
      
      if (response.success) {
        setEmailSent(true)
        toast.success('Лист підтвердження надіслано!')
      } else {
        toast.error(response.message || 'Помилка відправки листа')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Помилка відправки листа')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setEmailSent(false)
    const email = getValues('email')
    if (email) {
      onSubmit({ email })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Повторна відправка підтвердження
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Введіть вашу електронну пошту для повторної відправки листа підтвердження
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Підтвердження електронної пошти
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  {...register('email')}
                  type="email"
                  label="Адреса електронної пошти"
                  placeholder="Введіть вашу електронну пошту"
                  error={errors.email?.message}
                  leftIcon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Надіслати лист підтвердження
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Лист надіслано!
                </h3>
                <p className="text-gray-600">
                  Ми надіслали лист підтвердження на <strong>{getValues('email')}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Що робити далі:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Перевірте вашу поштову скриньку</li>
                    <li>• Перевірте папку "Спам"</li>
                    <li>• Натисніть на посилання в листі</li>
                    <li>• Поверніться на сторінку входу</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleResend}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Надіслати ще раз
                  </Button>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Повернутися до входу
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!emailSent && (
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Повернутися до входу
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}