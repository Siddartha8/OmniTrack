"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion } from "framer-motion";

export function Background() {
  const { theme } = useThemeStore();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-background transition-colors duration-1000" />
      
      {theme === "anime" && (
        <>
          <motion.div 
            className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[120px]"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[120px]"
            animate={{ 
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {theme === "ghibli" && (
        <>
          <motion.div 
            className="absolute top-0 right-0 w-[80vw] h-[80vw] rounded-full bg-primary/15 blur-[100px]"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay" />
        </>
      )}

      {theme === "sports" && (
        <>
          <motion.div 
            className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[150px]"
            animate={{ 
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-black/10 opacity-10 mix-blend-multiply" />
        </>
      )}
    </div>
  );
}
