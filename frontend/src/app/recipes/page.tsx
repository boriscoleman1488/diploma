import { Metadata } from 'next'
import { RecipesList } from '@/components/recipes/RecipesList'
import { RecipesFilters } from '@/components/recipes/RecipesFilters'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Recipes - Recipe App',
  description: 'Browse our collection of amazing recipes',
}

export default function RecipesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Recipes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our collection of delicious recipes from around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <RecipesFilters />
          </div>
          <div className="lg:col-span-3">
            <RecipesList />
          </div>
        </div>
      </div>
    </Layout>
  )
}