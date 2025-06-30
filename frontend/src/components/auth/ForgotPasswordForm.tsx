import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Будь ласка, введіть дійсну адресу електронної пошти'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword, isForgotPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await forgotPassword(data.email)
    
    if (result.success) {
      setEmailSent(true)
    }
  }

  return (
    <>
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
            isLoading={isForgotPassword}
            disabled={isForgotPassword}
          >
            Надіслати інструкції для скидання пароля
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Інструкції надіслано!
          </h3>
          <p className="text-gray-600">
            Ми надіслали інструкції для скидання пароля на <strong>{getValues('email')}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Що робити далі:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Перевірте вашу поштову скриньку</li>
              <li>• Перевірте папку "Спам"</li>
              <li>• Натисніть на посилання в листі</li>
              <li>• Створіть новий пароль</li>
            </ul>
          </div>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Повернутися до входу
            </Button>
          </Link>
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
    </>
  )
}