import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const initials = name ? getInitials(name) : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'avatar object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'avatar',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
}