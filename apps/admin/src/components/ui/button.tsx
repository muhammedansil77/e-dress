import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-coffee-700 text-cream-50 hover:bg-coffee-800 focus:ring-gold-500 shadow-sm border border-coffee-800',
      secondary:
        'bg-cream-300 text-coffee-900 hover:bg-cream-400 focus:ring-coffee-700 border border-cream-400/60 font-semibold',
      outline:
        'border border-cream-400 text-coffee-900 bg-cream-50 hover:bg-cream-200/70 focus:ring-gold-500',
      ghost:
        'text-coffee-600 hover:bg-cream-200 hover:text-coffee-900 focus:ring-cream-400',
      danger:
        'bg-rose-800 text-cream-50 hover:bg-rose-900 focus:ring-rose-600 shadow-sm',
      gold:
        'bg-gold-500 text-coffee-900 hover:bg-gold-600 focus:ring-gold-600 font-semibold shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
