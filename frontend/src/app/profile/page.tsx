import { Metadata } from 'next'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile settings',
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}