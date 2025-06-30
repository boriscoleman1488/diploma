import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface UserSearchProps {
  searchQuery: string
  onSearch: (query: string) => void
}

export function UserSearch({ searchQuery, onSearch }: UserSearchProps) {
  const debouncedSearch = debounce((query: string) => {
    onSearch(query)
  }, 500)

  const handleSearch = (query: string) => {
    onSearch(query)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Пошук користувачів за ім'ям, email або тегом..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}