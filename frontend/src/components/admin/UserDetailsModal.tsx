'use client'

import { AdminUserDetails } from '@/types/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { UserRoleSelect } from './UserRoleSelect'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { t } from '@/lib/translations'
import { 
  X, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle,
  Trash2
} from 'lucide-react'

interface UserDetailsModalProps {
  user: AdminUserDetails
  onClose: () => void
  onRoleChange: (userId: string, role: 'user' | 'admin') => Promise<{ success: boolean; error?: string }>
  onDelete: (userId: string) => Promise<{ success: boolean; error?: string }>
  isUpdating: boolean
}

export function UserDetailsModal({ 
  user, 
  onClose, 
  onRoleChange, 
  onDelete, 
  isUpdating 
}: UserDetailsModalProps) {
  const handleDelete = async () => {
    if (window.confirm(t('messages.confirmDeleteUser'))) {
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
            {t('admin.userDetails')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            {t('common.close')}
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatar_url}
              name={user.full_name || user.email}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.full_name || t('common.unknown')}
              </h3>
              <p className="text-gray-600">@{user.profile_tag || 'user'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.profileInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('auth.email')}</dt>
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
                  <dt className="text-sm font-medium text-gray-500">{t('profile.fullName')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.full_name || t('common.notProvided')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('profile.profileTag')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    @{user.profile_tag || t('common.notSet')}
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
              <CardTitle>{t('common.actions')}</CardTitle>
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
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isUpdating}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    {t('admin.deleteUser')}
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    Ця дія незворотна. Користувач та всі його дані будуть видалені.
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