"use client";

import { motion } from "framer-motion";

export function DavinciLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center w-12 h-12 ${className}`}>
      {/* Ambient Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-white/50 to-accent blur-md opacity-70 mix-blend-screen"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Outer Holographic Ring */}
      <motion.div
        className="absolute inset-[2px] rounded-full border-[1.5px] border-white/30 backdrop-blur-xl"
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          boxShadow: "inset 0 0 10px rgba(255,255,255,0.2), 0 0 10px rgba(var(--color-primary),0.3)"
        }}
      >
        <div className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
        <div className="absolute -bottom-1 left-1/2 -ml-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
      </motion.div>

      {/* Fluid Inner Morphing Shapes */}
      <motion.div
        className="absolute inset-[6px] rounded-[40%] bg-gradient-to-br from-primary/40 to-accent/40 mix-blend-screen backdrop-blur-md border border-white/40"
        animate={{
          rotate: [0, 180, 360],
          borderRadius: ["40% 60% 60% 40%", "60% 40% 40% 60%", "40% 60% 60% 40%"],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[6px] rounded-[60%] bg-gradient-to-tl from-white/30 to-primary/30 mix-blend-screen border border-white/20"
        animate={{
          rotate: [360, 180, 0],
          borderRadius: ["60% 40% 40% 60%", "40% 60% 60% 40%", "60% 40% 40% 60%"],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Brilliant Core */}
      <motion.div 
        className="absolute w-2.5 h-2.5 bg-white rounded-full z-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: "0 0 20px 8px rgba(255,255,255,0.9), 0 0 40px 15px rgba(var(--color-primary),0.6)"
        }}
      />
    </div>
  );
}
