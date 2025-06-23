import { Metadata } from 'next'
import { MyRecipes } from '@/components/dashboard/MyRecipes'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'My Recipes - Recipe App',
  description: 'Manage your recipes',
}

export default function MyRecipesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <MyRecipes />
      </Layout>
    </ProtectedRoute>
  )
}