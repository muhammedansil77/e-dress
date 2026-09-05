'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../features/auth/auth-context';

export default function RootPage() {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [admin, isLoading, router]);

  return null;
}
