'use client'

import { ChefHat, Users, Star, Heart } from 'lucide-react'

export function StatsSection() {
  const stats = [
    {
      icon: ChefHat,
      value: '1,000+',
      label: 'Recipes',
      description: 'Delicious recipes from around the world'
    },
    {
      icon: Users,
      value: '500+',
      label: 'Active Chefs',
      description: 'Talented home cooks and professionals'
    },
    {
      icon: Star,
      value: '4.9',
      label: 'Average Rating',
      description: 'High-quality, tested recipes'
    },
    {
      icon: Heart,
      value: '10K+',
      label: 'Recipe Likes',
      description: 'Community-approved favorites'
    }
  ]

  return (
    <section className="py-16 bg-primary-600">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Be part of a passionate community of food lovers sharing their culinary adventures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-xl font-semibold text-primary-100 mb-2">
                {stat.label}
              </div>
              <p className="text-primary-200 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}