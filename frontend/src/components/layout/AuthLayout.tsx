'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Recipe App
              </span>
            </Link>
            <ThemeToggle />
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Delicious food"
        />
        <div className="absolute inset-0 bg-primary-600 bg-opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">
              Join Our Culinary Community
            </h2>
            <p className="text-xl opacity-90">
              Discover amazing recipes and share your culinary creations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}