import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'indigo' | 'primary' | 'gold';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', size = 'md', children, ...props }) => {
  const variants = {
    primary: 'bg-coffee-700 text-cream-50 border-coffee-800',
    gold: 'bg-gold-500/15 text-gold-600 border-gold-500/40',
    indigo: 'bg-gold-500/15 text-gold-600 border-gold-500/40',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    info: 'bg-cream-200 text-coffee-700 border-cream-400',
    neutral: 'bg-cream-100 text-coffee-600 border-cream-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-md border tracking-wide uppercase',
        variants[variant] || variants.neutral,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
