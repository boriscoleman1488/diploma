import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserRoleSelect } from '@/components/admin/UserRoleSelect'
import { formatDate } from '@/lib/utils'
import { 
  Users, 
  Eye, 
  Mail, 
  Calendar, 
  Crown 
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name?: string
  profile_tag?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
}

interface UsersTableProps {
  users: User[]
  isLoading: boolean
  currentUserProfile: any
  canModifyUser: (userId: string) => boolean
  onViewUser: (userId: string) => void
  onRoleChange: (userId: string, role: 'user' | 'admin') => Promise<{ success: boolean }>
  isUpdating: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function UsersTable({ 
  users, 
  isLoading, 
  currentUserProfile,
  canModifyUser,
  onViewUser, 
  onRoleChange,
  isUpdating,
  pagination,
  onPageChange
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Користувачів не знайдено</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Список користувачів
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Користувач
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата реєстрації
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isCurrentUser = currentUserProfile && user.id === currentUserProfile.id
                const canModify = canModifyUser(user.id)
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={user.avatar_url}
                          name={user.full_name || user.email}
                          size="sm"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.full_name || 'Невідомо'}
                            {isCurrentUser && (
                              <Crown className="w-4 h-4 ml-2 text-yellow-500" title="Ваш акаунт" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.profile_tag || 'user'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserRoleSelect
                        currentRole={user.role}
                        onRoleChange={(role) => onRoleChange(user.id, role)}
                        disabled={isUpdating}
                        canModify={canModify}
                        isCurrentUser={isCurrentUser}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewUser(user.id)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Переглянути
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Показано {((pagination.page - 1) * pagination.limit) + 1} до{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} з{' '}
              {pagination.total} результатів
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Попередня
              </Button>
              <span className="text-sm text-gray-700">
                Сторінка {pagination.page} з {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Наступна
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}