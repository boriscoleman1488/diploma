'use client'

import Link from 'next/link'
import { Search, ChefHat, Users, Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Amazing{' '}
              <span className="text-primary-600">Recipes</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
              Join our community of food lovers. Share your culinary creations, 
              discover new flavors, and cook with confidence.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search recipes..."
                  className="pl-10"
                />
              </div>
              <Button size="lg">
                Search
              </Button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/recipes">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Recipes
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join Community
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ChefHat className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">1K+</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recipes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">500+</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chefs</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">4.9</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Delicious food"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 dark:bg-primary-800 rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary-200 dark:bg-secondary-800 rounded-full opacity-20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}