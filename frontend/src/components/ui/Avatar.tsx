import { useState } from 'react'
import { cn } from '@/lib/utils'
import { generateAvatarUrl } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackClassName?: string
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className,
  fallbackClassName,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const shouldShowImage = src && !imageError
  const fallbackSrc = generateAvatarUrl(name)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <img
          src={fallbackSrc}
          alt={alt || name}
          className={cn('w-full h-full object-cover', fallbackClassName)}
        />
      )}
    </div>
  )
}