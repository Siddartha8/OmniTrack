"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('theme-anime', 'theme-ghibli', 'theme-sports');
    if (theme === 'ghibli') {
      root.classList.add('theme-ghibli');
    } else if (theme === 'sports') {
      root.classList.add('theme-sports');
    } else {
      root.classList.add('theme-anime');
    }
  }, [theme, mounted]);

  return <>{children}</>;
}
