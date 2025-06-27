'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Grid3X3, 
  ChefHat, 
  MessageCircle, 
  Star, 
  BookOpen,
  BarChart3
} from 'lucide-react'

const adminNavigation = [
  { name: 'Користувачі', href: '/admin/users', icon: Users },
  { name: 'Категорії', href: '/admin/categories', icon: Grid3X3 },
  { name: 'Страви', href: '/admin/dishes', icon: ChefHat },
  { name: 'Коментарі', href: '/admin/comments', icon: MessageCircle },
  { name: 'Рейтинги', href: '/admin/ratings', icon: Star }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Панель адміністратора
        </h2>
        <nav className="space-y-1">
          {adminNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}