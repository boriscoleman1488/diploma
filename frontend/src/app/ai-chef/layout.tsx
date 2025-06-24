import { AuthGuard } from '@/components/auth/AuthGuard'
import { Navigation } from '@/components/layout/Navigation'

export default function AiChefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}