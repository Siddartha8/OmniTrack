"use client";

import { useAnimeStore } from "@/store/useAnimeStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays } from 'date-fns';

export default function Analytics() {
  const { entries, getProgressList } = useAnimeStore();
  const progressList = getProgressList().sort((a,b) => b.total_episodes - a.total_episodes);

  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'MMM dd'),
      rawDate: format(d, 'yyyy-MM-dd'),
      minutes: 0,
      episodes: 0
    };
  });

  entries.forEach(entry => {
    const dateStr = format(new Date(entry.created_at), 'yyyy-MM-dd');
    const dayData = last7Days.find(d => d.rawDate === dateStr);
    if (dayData) {
      const parts = entry.duration.toString().split(':').map(Number);
      const m = parts[0] || 0;
      const s = parts[1] || 0;
      dayData.minutes += (m + (s / 60));
      dayData.episodes += 1;
    }
  });

  const pieData = progressList.slice(0, 5).map(p => ({
    name: p.anime_name,
    value: p.total_episodes
  }));

  const COLORS = ['#c084fc', '#f97316', '#68d391', '#3b82f6', '#ef4444'];

  return (
    <div className="flex flex-col gap-8 mt-8 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Insights & Analytics
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Dive deep into your viewing habits and statistics.</p>
      </motion.div>

      <div className="flex flex-col gap-6">
        <GlassCard className="h-96 flex flex-col pt-6 px-6 relative">
          <h2 className="text-xl font-bold mb-6">Most Watched Anime (By Episodes)</h2>
          <div className="w-full flex items-center justify-center -mt-6" style={{ height: "300px" }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="30%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} 
                    formatter={(value: any) => [`${value} Episodes`, 'Watched']}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right" 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '15px', right: '5%', color: 'var(--foreground)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">Not enough data to display.</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="h-96 flex flex-col pt-6 px-6">
          <h2 className="text-xl font-bold mb-6">Activity Trend (Episodes Watched)</h2>
          <div className="w-full" style={{ height: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} 
                />
                <Line type="monotone" dataKey="episodes" stroke="var(--color-accent, #ea580c)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: "var(--color-accent, #ea580c)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
