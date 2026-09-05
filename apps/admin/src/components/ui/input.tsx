import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-coffee-900">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3 text-coffee-600 pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-cream-50 px-3 py-2 text-sm text-coffee-900 transition-all placeholder:text-coffee-600/50 shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500',
              error
                ? 'border-rose-600 focus:ring-rose-500'
                : 'border-cream-400',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 text-coffee-600">{rightIcon}</div>}
        </div>
        {error ? (
          <p className="text-xs text-rose-700 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-coffee-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
