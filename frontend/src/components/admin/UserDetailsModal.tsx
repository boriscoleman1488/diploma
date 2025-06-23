'use client'

import { AdminUserDetails } from '@/types/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { UserRoleSelect } from './UserRoleSelect'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  X, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react'

interface UserDetailsModalProps {
  user: AdminUserDetails
  onClose: () => void
  onRoleChange: (userId: string, role: 'user' | 'admin') => Promise<{ success: boolean; error?: string }>
  onDelete: (userId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating: boolean
  canModifyUser: (userId: string) => boolean
  currentUserProfile: any
}

export function UserDetailsModal({ 
  user, 
  onClose, 
  onRoleChange, 
  onDelete, 
  isUpdating,
  canModifyUser,
  currentUserProfile
}: UserDetailsModalProps) {
  const isCurrentUser = currentUserProfile && user.id === currentUserProfile.id
  const canModify = canModifyUser(user.id)

  const handleDelete = async () => {
    if (isCurrentUser) {
      return
    }

    if (window.confirm('Ви впевнені, що хочете видалити цього користувача? Ця дія незворотна.')) {
      const result = await onDelete(user.id)
      if (result.success) {
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Деталі користувача
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            Закрити
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current User Warning */}
          {isCurrentUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Це ваш власний акаунт
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ви не можете змінювати власну роль або видаляти власний акаунт з міркувань безпеки.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Header */}
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatar_url}
              name={user.full_name || user.email}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.full_name || 'Невідомо'}
                {isCurrentUser && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">(Ви)</span>
                )}
              </h3>
              <p className="text-gray-600">@{user.profile_tag || 'user'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>Інформація профілю</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Електронна пошта</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                    {user.email_confirmed_at ? (
                      <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 ml-2 text-red-600" />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Повне ім'я</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.full_name || 'Не вказано'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Тег профілю</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    @{user.profile_tag || 'Не встановлено'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Роль</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Часові мітки</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Дата реєстрації
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Останнє оновлення
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatRelativeTime(user.updated_at)}
                  </dd>
                </div>
                {user.last_sign_in_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Останній вхід
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatRelativeTime(user.last_sign_in_at)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Дії</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Змінити роль користувача
                  </label>
                  <UserRoleSelect
                    currentRole={user.role}
                    onRoleChange={(role) => onRoleChange(user.id, role)}
                    disabled={isUpdating}
                    canModify={canModify}
                    isCurrentUser={isCurrentUser}
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isUpdating || isCurrentUser}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    Видалити користувача
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    {isCurrentUser 
                      ? 'Ви не можете видалити власний акаунт.'
                      : 'Ця дія незворотна. Користувач та всі його дані будуть видалені.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}