import { Metadata } from 'next'
import { CreateRecipeForm } from '@/components/recipes/CreateRecipeForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Create Recipe - Recipe App',
  description: 'Create a new recipe',
}

export default function CreateRecipePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Recipe
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Share your culinary creation with the community
              </p>
            </div>
            <CreateRecipeForm />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}