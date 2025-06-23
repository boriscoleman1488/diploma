'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category } from '@/types/category'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Save } from 'lucide-react'

const editCategorySchema = z.object({
  name: z.string().min(2, 'Назва повинна містити принаймні 2 символи').max(100, 'Назва занадто довга'),
  description: z.string().max(500, 'Опис занадто довгий').optional(),
})

type EditCategoryFormData = z.infer<typeof editCategorySchema>

interface EditCategoryModalProps {
  category: Category
  onClose: () => void
  onSubmit: (data: EditCategoryFormData) => Promise<void>
  isLoading: boolean
}

export function EditCategoryModal({ category, onClose, onSubmit, isLoading }: EditCategoryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || '',
    },
  })

  const handleFormSubmit = async (data: EditCategoryFormData) => {
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Редагувати категорію
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="w-4 h-4" />}
          >
            Закрити
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <Input
            {...register('name')}
            label="Назва категорії"
            placeholder="Введіть назву категорії"
            error={errors.name?.message}
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Опис (необов'язково)
            </label>
            <textarea
              {...register('description')}
              placeholder="Введіть опис категорії"
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Зберегти зміни
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}