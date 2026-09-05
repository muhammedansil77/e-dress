import React, { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-cream-400 rounded-2xl bg-cream-50/80">
      <div className="p-3 bg-cream-200 text-coffee-700 rounded-2xl mb-3.5 border border-cream-300">
        {icon}
      </div>
      <h4 className="text-base font-bold text-coffee-900">{title}</h4>
      <p className="text-xs text-coffee-600 max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
