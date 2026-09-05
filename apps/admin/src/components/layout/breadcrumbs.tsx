'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/login') return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-coffee-600 py-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-gold-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const formattedTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-cream-400" />
            {isLast ? (
              <span className="font-semibold text-coffee-900">{formattedTitle}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-gold-600 transition-colors"
              >
                {formattedTitle}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
