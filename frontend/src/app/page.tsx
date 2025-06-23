import { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedRecipes } from '@/components/home/FeaturedRecipes'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { StatsSection } from '@/components/home/StatsSection'
import { Layout } from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Recipe App - Discover Amazing Recipes',
  description: 'Discover, create, and share amazing recipes with our community of food lovers.',
}

export default function HomePage() {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <FeaturedRecipes />
        <CategoriesSection />
        <StatsSection />
      </div>
    </Layout>
  )
}