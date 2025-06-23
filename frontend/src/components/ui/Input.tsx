import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { InputProps } from '@/types'

interface ExtendedInputProps extends React.InputHTMLAttributes<HTMLInputElement>, InputProps {}

export const Input = forwardRef<HTMLInputElement, ExtendedInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'input',
            error && 'input-error',
            className
          )}
          {...props}
        />
        
        {error && <p className="error-text">{error}</p>}
        {helperText && !error && <p className="helper-text">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'