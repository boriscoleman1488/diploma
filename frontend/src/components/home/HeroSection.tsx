import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { 
  ChefHat, 
  Plus, 
  Search
} from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  onSearchClick: () => void
}

export function HeroSection({ onSearchClick }: HeroSectionProps) {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Відкрийте світ смаків
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Знайдіть ідеальні страви від нашої спільноти кулінарів. 
            Готуйте, діліться та насолоджуйтеся!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dishes/add">
                <Button 
                  size="lg"
                  variant="secondary"
                  leftIcon={<Plus className="w-5 h-5" />}
                  className="bg-white text-primary-600 hover:bg-primary-50"
                >
                  Додати свою страву
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button 
                  size="lg"
                  variant="secondary"
                  leftIcon={<ChefHat className="w-5 h-5" />}
                  className="bg-white text-primary-600 hover:bg-primary-50"
                >
                  Приєднатися
                </Button>
              </Link>
            )}
            <Button 
              size="lg"
              variant="outline"
              leftIcon={<Search className="w-5 h-5" />}
              className="border-white text-white hover:bg-white hover:text-primary-600"
              onClick={onSearchClick}
            >
              Знайти страви
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}