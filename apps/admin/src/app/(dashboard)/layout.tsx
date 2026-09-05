'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../features/auth/auth-context';
import { Sidebar } from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/login');
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 text-coffee-600">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-100 text-coffee-900 flex">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        {/* Header */}
        <Header onOpenMobile={() => setIsMobileOpen(true)} />

        {/* Body Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl w-full mx-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
