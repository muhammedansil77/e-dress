import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-coffee-900">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-lg border bg-cream-50 px-3 py-2 text-sm text-coffee-900 transition-all placeholder:text-coffee-600/50 min-h-[80px] shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500',
            error
              ? 'border-rose-600 focus:ring-rose-500'
              : 'border-cream-400',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-700 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-coffee-600">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
