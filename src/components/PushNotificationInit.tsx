'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { registerPlayerIdWithBackend } from '@/lib/onesignal';

export default function PushNotificationInit() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    // Small delay so the page is interactive before prompting
    const timer = setTimeout(() => {
      registerPlayerIdWithBackend().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return null;
}
