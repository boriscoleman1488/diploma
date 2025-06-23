import Link from 'next/link'
import { ChefHat } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <ChefHat className="h-10 w-10 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900">Recipe App</span>
        </Link>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {footerText}{' '}
            <Link
              href={footerLinkHref}
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}