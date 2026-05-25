'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  let target = null;
  if (!loading) {
    if (!user) target = '/login';
    else if (!user.isVerified) target = '/verify-email';
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (loading || target) return null;
  return children;
}
