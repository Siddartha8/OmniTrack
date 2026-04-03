"use client";

import { Home, BarChart2, Settings, CheckSquare, LogOut, Film, Tv, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useThemeStore } from "@/store/useThemeStore";
import { useAnimeStore } from "@/store/useAnimeStore";
import { DavinciLogo } from "@/components/ui/DavinciLogo";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

const navItems = [
  { icon: Home, label: "Anime", href: "/" },
  { icon: CheckSquare, label: "Completed", href: "/completed" },
  { icon: Clock, label: "Waiting", href: "/waiting" },
  { icon: Film, label: "Movies", href: "/movies" },
  { icon: Tv, label: "Series", href: "/series" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const fetchData = useAnimeStore(state => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleTheme = () => {
    if (theme === 'anime') setTheme('ghibli');
    else if (theme === 'ghibli') setTheme('sports');
    else setTheme('anime');
  };

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-8 py-8 px-3 glass-panel rounded-full animate-float shadow-xl">
      <div className="mb-4">
        <DavinciLogo />
      </div>
      
      <div className="flex flex-col gap-6 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group p-3 rounded-full transition-all duration-300 hover:bg-white/10"
            >
              <item.icon
                className={`w-6 h-6 transition-colors duration-300 relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 rounded-full border border-primary/50 shadow-[0_0_10px_var(--color-primary)] bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap text-sm font-medium z-50 shadow-lg">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-6 border-t border-border w-full flex justify-center flex-col items-center gap-6">
        <button onClick={handleLogout} className="relative group p-3 rounded-full transition-all duration-300 hover:bg-red-500/10 cursor-pointer text-muted-foreground hover:text-red-500">
          <LogOut className="w-6 h-6" />
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap text-sm font-medium z-50 shadow-lg text-white">
            Log Out
          </div>
        </button>
        <button className="relative group p-3 rounded-full transition-all duration-300 hover:bg-white/10 cursor-pointer">
          <Settings className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
          
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap text-sm font-medium z-50 shadow-lg">
            Settings
          </div>
        </button>
        <button 
          onClick={toggleTheme}
          className="relative group w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent border-2 border-border shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer" 
        >
          <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap text-sm font-medium z-50 shadow-lg">
            Toggle Theme ({theme})
          </div>
        </button>
      </div>
    </nav>
  );
}
