import { Button } from '@/components/ui/Button'
import { FolderPlus } from 'lucide-react'

interface CollectionsHeaderProps {
  onCreateClick: () => void
}

export function CollectionsHeader({ onCreateClick }: CollectionsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Мої колекції
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Керуйте вашими колекціями страв
        </p>
      </div>
      <Button
        leftIcon={<FolderPlus className="w-4 h-4" />}
        onClick={onCreateClick}
      >
        Створити колекцію
      </Button>
    </div>
  )
}