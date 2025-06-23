import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      asChild,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn focus-visible'
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      danger: 'btn-danger',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }

    const iconSizeClass = iconSizeClasses[size]

    // If asChild is true, render children directly without button wrapper
    if (asChild) {
      return <>{children}</>
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : LeftIcon ? (
          <LeftIcon className={cn(iconSizeClass, 'mr-2')} />
        ) : null}
        
        {children}
        
        {RightIcon && !isLoading && (
          <RightIcon className={cn(iconSizeClass, 'ml-2')} />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'