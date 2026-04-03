"use client";

import { useAnimeStore } from "@/store/useAnimeStore";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function Timeline() {
  const { entries } = useAnimeStore();

  const grouped = entries.reduce((acc, entry) => {
    const dateStr = format(new Date(entry.created_at), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="relative border-l-2 border-primary/20 ml-4 pl-8 py-4 space-y-12">
      {sortedDates.map((dateStr, dateIdx) => (
        <div key={dateStr} className="relative">
          <div className="absolute -left-[39px] bg-background p-1 rounded-full border border-primary/50 shadow-[0_0_10px_rgba(var(--color-primary),0.3)]">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          
          <h3 className="text-xl font-bold mb-6 text-foreground/80">{getDateLabel(dateStr)}</h3>
          
          <div className="space-y-6">
            {grouped[dateStr].map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (dateIdx * 0.1) + (idx * 0.05) }}
                className="group relative"
              >
                <div className="glass-panel p-4 rounded-xl hover:shadow-[0_4px_20px_0_rgba(var(--color-primary),0.15)] transition-all hover:-translate-y-1 duration-300">
                  <div className="flex justify-between items-start">
                    <div>
              <h4 className="font-bold text-lg text-foreground/90">{entry.anime_name}</h4>
              <p className="text-sm text-primary font-medium mt-1">
                {entry.season ? `Season ${entry.season} • ` : ''}Episode {entry.episode}
              </p>
            </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {sortedDates.length === 0 && (
        <div className="text-muted-foreground font-medium py-10">No history yet. Start watching!</div>
      )}
    </div>
  );
}
