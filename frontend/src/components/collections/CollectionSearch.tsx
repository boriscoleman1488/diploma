import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

interface CollectionSearchProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function CollectionSearch({ searchQuery, setSearchQuery }: CollectionSearchProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Пошук страв у колекції..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}