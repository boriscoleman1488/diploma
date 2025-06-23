import { Metadata } from 'next'
import Link from 'next/link'
import { ChefHat, Users, Star, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Recipe App - Discover, create, and share amazing recipes',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Recipe App</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="btn btn-ghost btn-md"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register"
              className="btn btn-primary btn-md"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Discover Amazing
            <span className="text-primary-600 block">Recipes</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
            Join our community of food lovers. Create, share, and discover incredible recipes 
            from around the world. Start your culinary journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth/register"
              className="btn btn-primary btn-lg group"
            >
              Start Cooking
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/recipes"
              className="btn btn-outline btn-lg"
            >
              Browse Recipes
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Recipes
            </h3>
            <p className="text-gray-600">
              Share your favorite recipes with detailed instructions and beautiful photos.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Join Community
            </h3>
            <p className="text-gray-600">
              Connect with fellow food enthusiasts and discover new culinary inspirations.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Rate & Review
            </h3>
            <p className="text-gray-600">
              Rate recipes and leave reviews to help others find the best dishes.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Recipes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-2">5K+</div>
              <div className="text-gray-600">Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">50K+</div>
              <div className="text-gray-600">Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-8 mt-20 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <ChefHat className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-semibold text-gray-900">Recipe App</span>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <Link href="/about" className="hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          © 2024 Recipe App. All rights reserved.
        </div>
      </footer>
    </div>
  )
}