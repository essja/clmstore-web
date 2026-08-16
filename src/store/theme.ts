import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'warm' | 'heritage' | 'indigo';
export type LayoutMode = 'topbar' | 'sidebar';

interface ThemeState {
  theme: ThemeMode;
  layout: LayoutMode;
  setTheme: (theme: ThemeMode) => void;
  setLayout: (layout: LayoutMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default to user's favorite (Dark Glassmorphism)
      layout: 'topbar',
      setTheme: (theme) => set({ theme }),
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'restolink-theme-settings',
    }
  )
);
