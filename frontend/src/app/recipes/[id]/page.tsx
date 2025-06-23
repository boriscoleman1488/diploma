import { Metadata } from 'next'
import { RecipeDetail } from '@/components/recipes/RecipeDetail'
import { Layout } from '@/components/layout/Layout'

interface RecipePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  return {
    title: `Recipe - Recipe App`,
    description: 'View recipe details and instructions',
  }
}

export default function RecipePage({ params }: RecipePageProps) {
  return (
    <Layout>
      <RecipeDetail recipeId={params.id} />
    </Layout>
  )
}