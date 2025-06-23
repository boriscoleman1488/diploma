import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Recipe App - Discover Amazing Recipes',
    template: '%s | Recipe App',
  },
  description: 'Discover, create, and share amazing recipes with our community of food lovers.',
  keywords: ['recipes', 'cooking', 'food', 'kitchen', 'meals'],
  authors: [{ name: 'Recipe App Team' }],
  creator: 'Recipe App',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://recipeapp.com',
    title: 'Recipe App - Discover Amazing Recipes',
    description: 'Discover, create, and share amazing recipes with our community of food lovers.',
    siteName: 'Recipe App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recipe App - Discover Amazing Recipes',
    description: 'Discover, create, and share amazing recipes with our community of food lovers.',
    creator: '@recipeapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}