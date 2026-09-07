'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from '../cart/cart-drawer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export const StorefrontShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-[#F7F1E7] text-[#2F241D]">
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </QueryClientProvider>
  );
};
