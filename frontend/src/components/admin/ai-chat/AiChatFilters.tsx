import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Search } from 'lucide-react'

interface AiChatFiltersProps {
  onSearch: (query: string) => void
  userFilter: string
  setUserFilter: (userId: string) => void
}

export function AiChatFilters({ onSearch, userFilter, setUserFilter }: AiChatFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query)
    onSearch(query)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Пошук чатів за назвою..."
              value={localSearchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="md:w-64">
            <Input
              placeholder="ID користувача (UUID)"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}