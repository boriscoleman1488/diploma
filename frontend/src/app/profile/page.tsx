'use client'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserHeader } from '@/components/profile/UserHeader'
import { StatsCards } from '@/components/profile/StatsCards'
import { ProfileInfo } from '@/components/profile/ProfileInfo'
import { QuickActions } from '@/components/profile/QuickActions'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { profile, stats, isLoading } = useUserProfile()

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
      <UserHeader profile={profile} />

      {/* Stats Cards */}
      {stats && (
        <StatsCards stats={stats} user={user} />
      )}

      {/* Profile Information and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileInfo profile={profile} />
        <QuickActions emailConfirmed={user?.emailConfirmed || false} />
      </div>
    </div>
  )
}