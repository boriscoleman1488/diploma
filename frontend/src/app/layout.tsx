import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Додаток Рецептів - Керуйте Вашою Кулінарною Подорожжю',
  description: 'Створюйте, діліться та відкривайте дивовижні рецепти з нашою комплексною платформою управління рецептами.',
  keywords: ['рецепти', 'кулінарія', 'їжа', 'кухня', 'готування'],
  authors: [{ name: 'Команда Додатку Рецептів' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Додаток Рецептів - Керуйте Вашою Кулінарною Подорожжю',
    description: 'Створюйте, діліться та відкривайте дивовижні рецепти з нашою комплексною платформою управління рецептами.',
    type: 'website',
    locale: 'uk_UA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Додаток Рецептів - Керуйте Вашою Кулінарною Подорожжю',
    description: 'Створюйте, діліться та відкривайте дивовижні рецепти з нашою комплексною платформою управління рецептами.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}