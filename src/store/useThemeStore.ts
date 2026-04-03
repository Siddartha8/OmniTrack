import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'anime' | 'ghibli' | 'sports';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'anime', // default theme
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'anime-tracker-theme',
    }
  )
);
