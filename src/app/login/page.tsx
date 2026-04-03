"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Background } from "@/components/layout/Background";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <Background />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard className="p-8 flex flex-col gap-6">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Watch Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? "Create a new account" : "Welcome back. Log in to continue."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/30"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                required
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/30"
              />
            </div>

            {error && (
              <div className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="text-center mt-2">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {isSignUp 
                ? "Already have an account? Sign In." 
                : "Don't have an account? Sign Up."}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
