import Link from 'next/link'

interface AuthHeaderProps {
  title: string
  subtitle?: string
  linkText?: string
  linkHref?: string
}

export function AuthHeader({ title, subtitle, linkText, linkHref }: AuthHeaderProps) {
  return (
    <div className="text-center">
      <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">R</span>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">
        {title}
      </h2>
      {subtitle && linkText && linkHref && (
        <p className="mt-2 text-sm text-gray-600">
          {subtitle}{' '}
          <Link
            href={linkHref}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {linkText}
          </Link>
        </p>
      )}
    </div>
  )
}