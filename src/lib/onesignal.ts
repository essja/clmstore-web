import OneSignal from 'react-onesignal';
import { notificationApi } from '@/lib/api';

let initialised = false;

export async function initOneSignal(): Promise<void> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId || initialised || typeof window === 'undefined') return;

  try {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      serviceWorkerPath: '/OneSignalSDKWorker.js',
    });
    initialised = true;
  } catch (e) {
    console.warn('[OneSignal] init failed:', e);
  }
}

export async function registerPlayerIdWithBackend(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await initOneSignal();
    const playerId = OneSignal.User.PushSubscription.id;
    if (playerId) {
      await notificationApi.registerDevice(playerId);
    }
  } catch (e) {
    console.warn('[OneSignal] player ID registration failed:', e);
  }
}
