'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { Navigation } from '@/components/layout/Navigation'

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}