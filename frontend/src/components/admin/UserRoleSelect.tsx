'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { t } from '@/lib/translations'
import { Shield, User } from 'lucide-react'

interface UserRoleSelectProps {
  currentRole: 'user' | 'admin'
  onRoleChange: (role: 'user' | 'admin') => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
}

export function UserRoleSelect({ currentRole, onRoleChange, disabled }: UserRoleSelectProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (newRole === currentRole || isChanging) return

    setIsChanging(true)
    await onRoleChange(newRole)
    setIsChanging(false)
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentRole === 'user' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => handleRoleChange('user')}
        disabled={disabled || isChanging}
        leftIcon={<User className="w-4 h-4" />}
      >
        Користувач
      </Button>
      <Button
        variant={currentRole === 'admin' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => handleRoleChange('admin')}
        disabled={disabled || isChanging}
        leftIcon={<Shield className="w-4 h-4" />}
      >
        Адміністратор
      </Button>
    </div>
  )
}