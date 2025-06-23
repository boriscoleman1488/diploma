import { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Dashboard - Recipe App',
  description: 'Manage your recipes and account',
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardOverview />
      </Layout>
    </ProtectedRoute>
  )
}