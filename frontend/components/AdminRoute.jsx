'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  let target = null;
  if (!loading) {
    if (!user) target = '/login';
    else if (!user.isVerified) target = '/verify-email';
    else if (user.role !== 'admin') target = '/';
  }

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (loading || target) return null;
  return children;
}
