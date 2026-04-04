"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAnimeStore } from "@/store/useAnimeStore";
import { GlassCard } from "./ui/GlassCard";

interface AddCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCompletedModal({ isOpen, onClose }: AddCompletedModalProps) {
  const { addEntryAsync, markCompleted } = useAnimeStore();
  const [formData, setFormData] = useState({
    animeName: "",
    totalEpisodes: "",
    season: "",
    type: "Anime",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animeName) return;

    const episodes = parseInt(formData.totalEpisodes) || 12;

    // Log a single consolidated entry representing the completed series
    await addEntryAsync({
      anime_name: formData.animeName,
      type: formData.type.toLowerCase(),
      season: formData.season.trim() ? formData.season.trim() : "1",
      episode: episodes.toString(),
      total_episodes: episodes.toString(),
      duration: formData.type === 'Movie' ? '120' : (episodes * 24).toString(),
    });
    
    // Explicitly mark this series as completed in the store
    await markCompleted(formData.animeName);

    setFormData({ animeName: "", totalEpisodes: "", season: "", type: "Anime" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="flex flex-col p-6 shadow-2xl border-accent/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-2xl font-bold text-accent">Log Completed Anime</h2>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-2 p-1 bg-black/30 rounded-xl mb-1">
                {["Anime", "Movie", "Series"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === t ? 'bg-accent/20 text-accent border border-accent/30 box-shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Anime Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullmetal Alchemist: Brotherhood"
                  value={formData.animeName}
                  onChange={(e) => setFormData({ ...formData, animeName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Total Episodes</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 64"
                    value={formData.totalEpisodes}
                    onChange={(e) => setFormData({ ...formData, totalEpisodes: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Season (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    min="1"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-accent text-accent-foreground font-bold rounded-xl shadow-[0_0_15px_rgba(var(--color-accent),0.4)] hover:shadow-[0_0_25px_rgba(var(--color-accent),0.6)] transition-all transform hover:-translate-y-0.5"
              >
                Log as Completed
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
