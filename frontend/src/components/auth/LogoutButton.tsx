import { useRouter } from 'next/navigation'
import { Button, ButtonProps } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  redirectTo?: string
  onClick?: () => void
}

export function LogoutButton({ 
  redirectTo = '/auth/login', 
  children = 'Вийти', 
  onClick,
  ...props 
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      if (onClick) {
        onClick()
      }
      router.push(redirectTo)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      isLoading={isLoading}
      disabled={isLoading}
      leftIcon={!isLoading ? <LogOut className="w-4 h-4" /> : undefined}
      {...props}
    >
      {children}
    </Button>
  )
}