import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ButtonProps } from '@/types'
import { LoadingSpinner } from './LoadingSpinner'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false, 
    type = 'button',
    onClick,
    className,
    ...props 
  }, ref) => {
    const baseClasses = 'btn focus-visible'
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    }
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'