'use client'

import { useState } from 'react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserDetailsModal } from '@/components/admin/UserDetailsModal'
import { UserRoleSelect } from '@/components/admin/UserRoleSelect'
import { formatDate, formatRelativeTime, debounce } from '@/lib/utils'
import { t } from '@/lib/translations'
import { 
  Users, 
  Search, 
  Eye, 
  Shield, 
  User,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserDetails, setShowUserDetails] = useState(false)
  
  const {
    users,
    selectedUser,
    stats,
    isLoading,
    isUpdating,
    pagination,
    fetchUsers,
    fetchUserDetails,
    updateUserRole,
    deleteUser,
    setSelectedUser,
  } = useAdminUsers()

  const debouncedSearch = debounce((query: string) => {
    fetchUsers(1, pagination.limit, query)
  }, 500)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.limit, searchQuery)
  }

  const handleViewUser = async (userId: string) => {
    const user = await fetchUserDetails(userId)
    if (user) {
      setShowUserDetails(true)
    }
  }

  const handleCloseModal = () => {
    setShowUserDetails(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.userManagement')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Керуйте користувачами та їх правами доступу
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього користувачів</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Звичайні користувачі</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.roleDistribution.user || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Адміністратори</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.roleDistribution.admin || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Пошук користувачів за ім'ям, email або тегом..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Список користувачів
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'Користувачів не знайдено' : 'Немає користувачів'}
              </p>
            </div>
          ) : (
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={user.avatar_url}
                            name={user.full_name || user.email}
                            size="sm"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || t('common.unknown')}
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
                          onRoleChange={(role) => updateUserRole(user.id, role)}
                          disabled={isUpdating}
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
                          onClick={() => handleViewUser(user.id)}
                          leftIcon={<Eye className="w-4 h-4" />}
                        >
                          Переглянути
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Попередня
                </Button>
                <span className="text-sm text-gray-700">
                  Сторінка {pagination.page} з {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Наступна
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
          onRoleChange={updateUserRole}
          onDelete={deleteUser}
          isUpdating={isUpdating}
        />
      )}
    </div>
  )
}