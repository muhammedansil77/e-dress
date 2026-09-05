import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Haute Admin | E-Commerce Dress & Apparel Management Platform',
  description:
    'Enterprise administration platform for multi-category fashion apparel, dresses, inventory, variants, orders, and customer operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  localStorage.theme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-cream-100 text-coffee-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
