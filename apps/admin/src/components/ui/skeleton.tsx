import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-cream-300/80', className)}
      {...props}
    />
  );
};
