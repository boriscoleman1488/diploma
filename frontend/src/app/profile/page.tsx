'use client'

import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  ChefHat, 
  Heart, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { profile, stats, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження профілю...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Профіль не знайдено</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name || profile.email}
              size="xl"
              className="ring-4 ring-white"
            />
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {profile.full_name || 'Невідомо'}
              </h1>
              <p className="text-primary-100 mt-1">
                @{profile.profile_tag || 'user'}
              </p>
              <div className="flex items-center mt-2 text-primary-100">
                <Mail className="w-4 h-4 mr-2" />
                {profile.email}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Приєднався {formatDate(profile.created_at)}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Останнє оновлення {formatRelativeTime(profile.updated_at)}
              </div>
            </div>
            <Link href="/profile/settings">
              <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                Редагувати профіль
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Додано страв</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recipesCreated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Улюблені страви</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.favoriteRecipes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  {user?.emailConfirmed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Статус електронної пошти</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.emailConfirmed ? 'Підтверджено' : 'Не підтверджено'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Останній вхід</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {stats.lastLogin !== 'Unknown' 
                      ? formatRelativeTime(stats.lastLogin)
                      : 'Невідомо'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Інформація профілю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Повне ім'я</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {profile.full_name || 'Не вказано'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Тег профілю</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  @{profile.profile_tag || 'Не встановлено'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Електронна пошта</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Роль</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.role}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/profile/settings" className="block">
                <Button variant="outline" className="w-full justify-start" leftIcon={<Settings className="w-4 h-4" />}>
                  Налаштування профілю
                </Button>
              </Link>
              <Link href="/profile/settings" className="block">
                <Button variant="outline" className="w-full justify-start" leftIcon={<User className="w-4 h-4" />}>
                  Змінити пароль
                </Button>
              </Link>
              {!user?.emailConfirmed && (
                <Button variant="outline" className="w-full justify-start" leftIcon={<Mail className="w-4 h-4" />}>
                  Підтвердити електронну пошту
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}