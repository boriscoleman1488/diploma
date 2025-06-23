import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe App - Discover Amazing Recipes',
  description: 'Discover, create, and share amazing recipes with our community of food lovers.',
  keywords: ['recipes', 'cooking', 'food', 'cuisine', 'ingredients'],
  authors: [{ name: 'Recipe App Team' }],
  openGraph: {
    title: 'Recipe App - Discover Amazing Recipes',
    description: 'Discover, create, and share amazing recipes with our community of food lovers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recipe App - Discover Amazing Recipes',
    description: 'Discover, create, and share amazing recipes with our community of food lovers.',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
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
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}