import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setAuth: (tokens: AuthTokens, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (tokens, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('clm_access_token', tokens.access_token);
          localStorage.setItem('clm_refresh_token', tokens.refresh_token);
        }
        set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('clm_access_token');
          localStorage.removeItem('clm_refresh_token');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'clm-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
