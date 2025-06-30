import { Button } from '@/components/ui/Button'
import { BookOpen, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'

export function AuthRequiredMessage() {
  return (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Увійдіть, щоб переглянути колекції
      </h2>
      <p className="text-gray-600 mb-6">
        Для доступу до колекцій страв потрібно увійти в систему
      </p>
      <div className="flex justify-center space-x-4">
        <Link href="/auth/login">
          <Button leftIcon={<LogIn className="w-4 h-4" />}>Увійти</Button>
        </Link>
        <Link href="/auth/register">
          <Button variant="outline" leftIcon={<UserPlus className="w-4 h-4" />}>Зареєструватися</Button>
        </Link>
      </div>
    </div>
  )
}