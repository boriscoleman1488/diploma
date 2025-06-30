import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

interface RatingFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  dishFilter: string
  setDishFilter: (filter: string) => void
}

export function RatingFilters({ 
  searchQuery, 
  setSearchQuery, 
  dishFilter, 
  setDishFilter 
}: RatingFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Пошук рейтингів за назвою страви або автором..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="md:w-48">
            <select
              value={dishFilter}
              onChange={(e) => setDishFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Всі страви</option>
              <option value="approved">Схвалені страви</option>
              <option value="pending">Страви на розгляді</option>
              <option value="rejected">Відхилені страви</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}