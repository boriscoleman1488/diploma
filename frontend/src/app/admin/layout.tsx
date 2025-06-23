import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { Navigation } from '@/components/layout/Navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

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
          <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminGuard>
    </AuthGuard>
  )
}