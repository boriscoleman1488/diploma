import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ChefHat, 
  Heart, 
  Settings, 
  Mail
} from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  emailConfirmed: boolean
}

export function QuickActions({ emailConfirmed }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Швидкі дії</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href="/profile/dishes" className="block">
            <Button variant="outline" className="w-full justify-start" leftIcon={<ChefHat className="w-4 h-4" />}>
              Мої страви
            </Button>
          </Link>
          <Link href="/collections" className="block">
            <Button variant="outline" className="w-full justify-start" leftIcon={<Heart className="w-4 h-4" />}>
              Мої колекції
            </Button>
          </Link>
          <Link href="/profile/settings" className="block">
            <Button variant="outline" className="w-full justify-start" leftIcon={<Settings className="w-4 h-4" />}>
              Налаштування профілю
            </Button>
          </Link>
          {!emailConfirmed && (
            <Link href="/auth/resend-confirmation" className="block">
              <Button variant="outline" className="w-full justify-start" leftIcon={<Mail className="w-4 h-4" />}>
                Підтвердити електронну пошту
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}