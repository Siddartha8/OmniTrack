"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tv, Film, PlayCircle } from "lucide-react";
import { useAnimeStore } from "@/store/useAnimeStore";
import { GlassCard } from "./ui/GlassCard";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEntryModal({ isOpen, onClose }: AddEntryModalProps) {
  const addEntryAsync = useAnimeStore((state) => state.addEntryAsync);
  const loadingState = useAnimeStore(state => state.loading);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    anime_name: "",
    type: "Anime",
    season: "1",
    episode: "",
    total_episodes: "",
    duration: "24"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.anime_name) return;
    
    setLoading(true);
    await addEntryAsync(formData);
    
    setFormData({ anime_name: "", type: "Anime", season: "1", episode: "", total_episodes: "", duration: "24" });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg pointer-events-auto"
            >
              <GlassCard className="p-8 shadow-2xl border-primary/20">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm">
                  Log New Progress
                </h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex gap-2 p-1 bg-black/30 rounded-xl">
                    {["Anime", "Movie", "Series"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === t ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                      Title
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.anime_name}
                      onChange={(e) => setFormData({ ...formData, anime_name: e.target.value })}
                      className="bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                      placeholder="e.g. Breaking Bad"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                        Season
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.season}
                        onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        className="bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                        Episode #
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.episode}
                        onChange={(e) => setFormData({ ...formData, episode: e.target.value })}
                        className="bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                        Total Season Eps (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.total_episodes}
                        onChange={(e) => setFormData({ ...formData, total_episodes: e.target.value })}
                        className="bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                        placeholder="Leave blank if unknown"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                        Time (MM:SS, Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="bg-black/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                        placeholder="24:00"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex justify-center items-center cursor-pointer"
                  >
                    {loading ? "Syncing..." : "Save to Cloud"}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
