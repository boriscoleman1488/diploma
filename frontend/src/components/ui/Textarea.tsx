import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { InputProps } from '@/types'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, InputProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'input resize-none',
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

Textarea.displayName = 'Textarea'