import { Metadata } from 'next'
import { ProfileSettings } from '@/components/profile/ProfileSettings'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Profile - Recipe App',
  description: 'Manage your profile settings',
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProfileSettings />
      </Layout>
    </ProtectedRoute>
  )
}