'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { apiClient } from '@/lib/api'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { isValidImageFile, compressImage } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImageUrl?: string
  onImageRemoved?: () => void
  type?: 'dish' | 'step'
  className?: string
  placeholder?: string
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  onImageRemoved,
  type = 'dish',
  className = '',
  placeholder = 'Завантажити зображення'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadEndpoint = type === 'step' ? '/dishes/upload-step-image' : '/dishes/upload-image'

  const handleFileSelect = async (file: File) => {
    if (!isValidImageFile(file)) {
      toast.error('Будь ласка, оберіть дійсний файл зображення (JPG, PNG або WebP)')
      return
    }

    setIsUploading(true)
    try {
      const compressedFile = await compressImage(file)
      const response = await apiClient.uploadFile(uploadEndpoint, compressedFile)
      
      if (response.success && response.imageUrl) {
        onImageUploaded(response.imageUrl)
        toast.success(response.message || 'Зображення завантажено успішно')
      } else {
        toast.error(response.message || 'Не вдалося завантажити зображення')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Не вдалося завантажити зображення')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {currentImageUrl ? (
        <div className="relative">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Завантажене зображення"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              leftIcon={isUploading ? <LoadingSpinner size="sm" /> : <Upload className="w-4 h-4" />}
            >
              {isUploading ? 'Завантаження...' : 'Замінити'}
            </Button>
            {onImageRemoved && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                leftIcon={<X className="w-4 h-4" />}
              >
                Видалити
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Завантаження зображення...</p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">{placeholder}</p>
              <p className="text-sm text-gray-500 mb-4">
                Перетягніть файл сюди або натисніть для вибору
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Обрати файл
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG або WebP. Максимум 10МБ.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}