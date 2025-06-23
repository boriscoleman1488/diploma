import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { Navigation } from '@/components/layout/Navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </AdminGuard>
    </AuthGuard>
  )
}