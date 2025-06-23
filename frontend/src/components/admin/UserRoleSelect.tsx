'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Shield, User, Lock } from 'lucide-react'

interface UserRoleSelectProps {
  currentRole: 'user' | 'admin'
  onRoleChange: (role: 'user' | 'admin') => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
  canModify?: boolean
  isCurrentUser?: boolean
}

export function UserRoleSelect({ 
  currentRole, 
  onRoleChange, 
  disabled, 
  canModify = true,
  isCurrentUser = false 
}: UserRoleSelectProps) {
  const [isChanging, setIsChanging] = useState(false)

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (newRole === currentRole || isChanging || !canModify) return

    setIsChanging(true)
    await onRoleChange(newRole)
    setIsChanging(false)
  }

  // If user cannot be modified, show read-only role
  if (!canModify || isCurrentUser) {
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          currentRole === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {currentRole === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
          {currentRole === 'admin' ? 'Адміністратор' : 'Користувач'}
        </span>
        {isCurrentUser && (
          <span className="text-xs text-gray-500 flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Ваша роль
          </span>
        )}
      </div>
    )
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