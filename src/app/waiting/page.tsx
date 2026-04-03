"use client";

import { useAnimeStore } from "@/store/useAnimeStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import { AnimeDetailsModal } from "@/components/AnimeDetailsModal";
import { AddEntryModal } from "@/components/AddEntryModal";
import { AnimeCover } from "@/components/AnimeCover";
import { useState } from "react";

export default function WaitingPage() {
  const { getProgressList } = useAnimeStore();
  const progressList = getProgressList().filter(a => a.status === 'waiting');
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "anime" | "movie" | "series">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredList = progressList.filter(anime => {
    const matchesSearch = anime.anime_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || anime.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col gap-8 mt-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Waiting List
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Tracking shows awaiting a new season</p>
        </motion.div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search waiting..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 px-4 py-2 bg-primary/20 text-primary font-bold rounded-full hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 border border-primary/20"
          >
            <Plus className="w-4 h-4" /> Add
          </button>

          <button className="p-2 px-4 rounded-full border border-border bg-black/20 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <Filter className="w-4 h-4 text-muted-foreground" />
            Filter
          </button>
        </div>
      </div>

      {/* Media Type Filter Tabs */}
      <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-full sm:w-max mx-auto md:mx-0">
        {(["all", "anime", "movie", "series"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 sm:px-6 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
              activeTab === tab 
                ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/5' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredList.map((anime, idx) => {
          return (
            <motion.div
              key={anime.anime_name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard 
                onClick={() => setSelectedAnime(anime.anime_name)}
                hoverEffect 
                className="h-full flex flex-col gap-4 overflow-hidden group cursor-pointer p-0 border-transparent hover:border-primary/30"
              >
                <div className="w-full h-48 bg-gradient-to-b from-primary/20 to-accent/10 relative overflow-hidden">
                  <AnimeCover title={anime.anime_name} type={anime.type} />

                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-primary/20 scale-90 group-hover:scale-100 transition-transform text-primary font-bold z-20">
                     Latest S{anime.latest_season}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col justify-center pt-4 pb-4">
                  <h3 className="font-bold text-xl line-clamp-1 text-center group-hover:text-primary transition-colors">{anime.anime_name}</h3>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground font-medium">
            No shows currently waiting.
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% { transform: translateX(200%); }
        }
      `}} />

      <AnimeDetailsModal animeName={selectedAnime} onClose={() => setSelectedAnime(null)} />
      <AddEntryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
