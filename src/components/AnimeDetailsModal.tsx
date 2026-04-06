"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Check, Trash2, Plus } from "lucide-react";
import { useAnimeStore, AnimeEntry } from "@/store/useAnimeStore";
import { GlassCard } from "./ui/GlassCard";
import { format } from "date-fns";

interface AnimeDetailsModalProps {
  animeName: string | null;
  onClose: () => void;
}

function InlineInput({ value, onSave, className = "" }: { value: string | number, onSave: (val: string) => void, className?: string }) {
  const [val, setVal] = useState(value);
  
  // Sync state if external value changes (e.g. from + or - button)
  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if (val !== value) onSave(val.toString());
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      className={`bg-transparent border-none outline-none text-white font-bold text-center min-w-[2.5rem] w-full max-w-[4rem] ${className}`}
    />
  );
}

export function AnimeDetailsModal({ animeName, onClose }: AnimeDetailsModalProps) {
  const { entries, editEntryAsync, deleteEntryAsync, addEntryAsync, markWatching, markWaiting, markCompleted } = useAnimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ season: string, episode: string; duration: string; notes: string }>({
    season: "1", episode: "", duration: "", notes: ""
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(animeName || "");

  if (!animeName) return null;

  const animeEntries = entries.filter((e) => e.anime_name === animeName).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Status extraction logic for Modal tri-state toggles
  const currentStatus = animeEntries.length > 0 ? animeEntries[0].status : 'watching';
  const currentType = animeEntries.length > 0 ? (animeEntries[0].type || 'anime').toLowerCase() : 'anime';
  
  // Group by Season
  const entriesBySeason = animeEntries.reduce((acc, entry) => {
    const s = entry.season || 1;
    if(!acc[s]) acc[s] = [];
    acc[s].push(entry);
    return acc;
  }, {} as Record<number, AnimeEntry[]>);

  const availableSeasons = Object.keys(entriesBySeason).map(Number).sort((a,b) => b - a);
  const highestSeason = availableSeasons.length > 0 ? Math.max(...availableSeasons) : 1;
  const entriesInHighestSeason = entriesBySeason[highestSeason] || [];
  const nextEpisode = entriesInHighestSeason.length > 0 ? Math.max(...entriesInHighestSeason.map(e => e.episode)) + 1 : 1;

  const startEdit = (entry: AnimeEntry) => {
    setEditingId(entry.id);
    setEditForm({ season: String(entry.season || 1), episode: String(entry.episode), duration: String(entry.duration), notes: entry.notes || "" });
    setIsAdding(false);
  };

  const saveEdit = (id: string) => {
    editEntryAsync(id, {
      season: parseInt(editForm.season) || 1,
      episode: parseInt(editForm.episode) || 1,
      duration: editForm.duration,
      notes: editForm.notes
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntryAsync({
      anime_name: animeName,
      type: animeEntries[0]?.type || "anime",
      total_episodes: "",
      season: editForm.season,
      episode: String(editForm.episode),
      duration: String(editForm.duration),
      notes: editForm.notes
    } as any);
    setIsAdding(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="flex flex-col h-full p-0 overflow-hidden shadow-2xl border-primary/20 bg-background/95">
            <div className="p-6 border-b border-border flex flex-col gap-4 bg-black/20">
              <div className="flex justify-between items-center">
                
                {isEditingTitle ? (
                  <div className="flex items-center gap-3 w-full pr-4">
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-2 text-xl font-bold focus:ring-1 focus:ring-primary outline-none text-foreground"
                      autoFocus
                    />
                    <button 
                      onClick={async () => {
                        if (newTitle.trim() && newTitle !== animeName) {
                          await useAnimeStore.getState().updateTitle(animeName, newTitle);
                          onClose();
                        } else {
                          setIsEditingTitle(false);
                        }
                      }}
                      className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsEditingTitle(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent line-clamp-1">
                      {animeName}
                    </h2>
                    <button onClick={() => { setIsEditingTitle(true); setNewTitle(animeName); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {!isEditingTitle && (
                  <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors cursor-pointer ml-auto">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Media Type Toggles */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-full sm:w-max">
                  {(["anime", "movie", "series"] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => useAnimeStore.getState().updateType(animeName, t)}
                      className={`flex-1 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${currentType === t ? 'bg-white/20 text-white border border-white/30 shadow-lg shadow-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Status Toggles */}
                <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-full sm:w-max">
                  <button 
                    onClick={() => markWatching(animeName)}
                    className={`flex-1 sm:px-5 py-2 text-sm font-bold rounded-lg transition-all ${currentStatus === 'watching' ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer'}`}
                  >
                    Watching
                  </button>
                  <button 
                    onClick={() => markWaiting(animeName)}
                    className={`flex-1 sm:px-5 py-2 text-sm font-bold rounded-lg transition-all ${currentStatus === 'waiting' ? 'bg-accent/20 text-accent border border-accent/30 shadow-lg shadow-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer'}`}
                  >
                    Waiting
                  </button>
                  <button 
                    onClick={() => markCompleted(animeName)}
                    className={`flex-1 sm:px-5 py-2 text-sm font-bold rounded-lg transition-all ${currentStatus === 'completed' ? 'bg-green-500/20 text-green-500 border border-green-500/30 shadow-lg shadow-green-500/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Activity Log</h3>
                {!isAdding && (
                  <button 
                    onClick={() => { setIsAdding(true); setEditForm({ season: String(highestSeason), episode: String(nextEpisode), duration: "24", notes: "" }); setEditingId(null); }}
                    className="flex items-center gap-2 text-sm font-bold bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Log Progress
                  </button>
                )}
              </div>

              {isAdding && (
                <div className="bg-black/30 p-5 rounded-xl border border-primary/30 shadow-inner">
                  <h4 className="font-bold mb-4 text-primary text-sm uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Entry
                  </h4>
                  <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Season</label>
                        <input type="number" min="1" autoComplete="off" id="new-entry-season" name="new-entry-season" value={editForm.season} onChange={(e) => setEditForm({...editForm, season: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Episode #</label>
                        <input type="number" required value={editForm.episode} onChange={(e) => setEditForm({...editForm, episode: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Time (MM:SS)</label>
                        <input type="text" required placeholder="15:30" value={editForm.duration} onChange={(e) => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Notes (Optional)</label>
                      <input type="text" placeholder="What happened in this episode?" value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                    </div>
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border/50">
                       <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors cursor-pointer">Cancel</button>
                       <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20">Save Entry</button>
                    </div>
                  </form>
                </div>
              )}

              {availableSeasons.map(seasonNum => (
                <div key={seasonNum} className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm shadow-primary/5">Season {seasonNum}</h4>
                    <div className="h-px bg-border flex-1" />
                  </div>
                  
                  {entriesBySeason[seasonNum].map((entry) => (
                    <div key={entry.id} className="bg-black/20 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors ml-2">
                      {editingId === entry.id ? (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Season</label>
                              <input type="number" min="1" autoComplete="off" id={`edit-season-${entry.id}`} name={`edit-season-${entry.id}`} value={editForm.season} onChange={(e) => setEditForm({...editForm, season: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Episode #</label>
                              <input type="number" value={editForm.episode} onChange={(e) => setEditForm({...editForm, episode: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">Time (MM:SS)</label>
                              <input type="text" value={editForm.duration} onChange={(e) => setEditForm({...editForm, duration: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Notes</label>
                            <input type="text" value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground" />
                          </div>
                          <div className="flex justify-between mt-2">
                            <button onClick={() => deleteEntryAsync(entry.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm hover:bg-white/10 rounded-lg transition-colors cursor-pointer">Cancel</button>
                              <button onClick={() => saveEdit(entry.id)} className="px-4 py-2 flex items-center gap-1 text-sm bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
                                <Check className="w-4 h-4" /> Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg text-primary">Episode</h4>
                              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-1.5 py-0.5 shadow-inner">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (entry.episode > 1) {
                                      editEntryAsync(entry.id, {
                                        episode: entry.episode - 1,
                                        duration: entry.duration,
                                        notes: entry.notes || "",
                                        season: entry.season || 1
                                      });
                                    }
                                  }}
                                  className="w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer text-lg leading-none"
                                >
                                  -
                                </button>
                                <InlineInput 
                                  value={entry.episode} 
                                  onSave={(val) => {
                                    editEntryAsync(entry.id, {
                                      episode: parseInt(val) || entry.episode,
                                      duration: entry.duration,
                                      notes: entry.notes || "",
                                      season: entry.season || 1
                                    });
                                  }}
                                  className="text-base"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editEntryAsync(entry.id, {
                                      episode: entry.episode + 1,
                                      duration: entry.duration,
                                      notes: entry.notes || "",
                                      season: entry.season || 1
                                    });
                                  }}
                                  className="w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer text-lg leading-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <h4 className="font-bold text-sm text-accent">Time</h4>
                              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-1.5 py-0.5 shadow-inner">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const parts = entry.duration.split(':').map(Number);
                                    let m = parts[0] || 0;
                                    const s = parts[1] || 0;
                                    if (m > 0) m -= 1;
                                    editEntryAsync(entry.id, {
                                      episode: entry.episode,
                                      duration: `${m}:${s.toString().padStart(2, '0')}`,
                                      notes: entry.notes || "",
                                      season: entry.season || 1
                                    });
                                  }}
                                  className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer text-sm leading-none"
                                >
                                  -
                                </button>
                                <InlineInput 
                                  value={entry.duration} 
                                  onSave={(val) => {
                                    editEntryAsync(entry.id, {
                                      episode: entry.episode,
                                      duration: val || "0:00",
                                      notes: entry.notes || "",
                                      season: entry.season || 1
                                    });
                                  }}
                                  className="text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const parts = entry.duration.split(':').map(Number);
                                    let m = parts[0] || 0;
                                    const s = parts[1] || 0;
                                    m += 1;
                                    editEntryAsync(entry.id, {
                                      episode: entry.episode,
                                      duration: `${m}:${s.toString().padStart(2, '0')}`,
                                      notes: entry.notes || "",
                                      season: entry.season || 1
                                    });
                                  }}
                                  className="w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer text-sm leading-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-3 text-[11px] text-muted-foreground mt-2 font-medium">
                              <span>{format(new Date(entry.created_at), 'MMM d, yyyy')}</span>
                            </div>
                            {entry.notes && <p className="text-sm mt-3 text-foreground/80 italic border-l-2 border-primary/30 pl-3">"{entry.notes}"</p>}
                          </div>
                          <button onClick={() => startEdit(entry)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {animeEntries.length === 0 && !isAdding && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-primary/50" />
                  </div>
                  <p className="font-medium">No progress logged yet.</p>
                  <p className="text-sm mt-1">Start tracking your journey by logging the first episode!</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
