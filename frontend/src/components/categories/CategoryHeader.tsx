import { Grid3X3 } from 'lucide-react'

export function CategoryHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Категорії страв
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Переглядайте та керуйте категоріями страв
        </p>
      </div>
    </div>
  )
}