import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { StorefrontShell } from '../components/layout/storefront-shell';

export const metadata: Metadata = {
  title: 'HAUTE COUTURE | Luxury Fashion & Designer Apparel',
  description: 'Shop signature maxi dresses, festive silk kurtis, and handcrafted luxury sarees with complimentary express delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
