import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface AnimeEntry {
  id: string;
  anime_name: string;
  type?: string;
  season?: number;
  episode: number;
  duration: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface AnimeProgress {
  anime_name: string;
  total_episodes: number;
  total_duration: string; // Displayed dynamically as MM:SS or Mins
  last_watched: string;
  status: 'watching' | 'completed' | 'waiting';
  type: string;
  latest_season: number;
}

interface AnimeState {
  entries: AnimeEntry[];
  completedSeries: string[];
  loading: boolean;
  fetchData: () => Promise<void>;
  addEntryAsync: (data: { anime_name: string, type: string, total_episodes: string, season: string, episode: string, duration: string }) => Promise<void>;
  markCompleted: (anime_name: string) => Promise<void>;
  markWatching: (anime_name: string) => Promise<void>;
  markWaiting: (anime_name: string) => Promise<void>;
  updateType: (anime_name: string, newType: string) => Promise<void>;
  updateTitle: (oldTitle: string, newTitle: string) => Promise<void>;
  getWeeklyStreak: () => number;
  getProgressList: () => AnimeProgress[];
  deleteEntryAsync: (progressId: string) => Promise<void>;
  editEntryAsync: (progressId: string, data: { episode: number, duration: string, notes?: string, season?: number }) => Promise<void>;
}

export const useAnimeStore = create<AnimeState>()((set, get) => ({
  entries: [],
  completedSeries: [],
  loading: true,

  fetchData: async () => {
    set({ loading: true });
    const supabase = createClient();
    
    // Check auth safely
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      set({ loading: false });
      // Zombie state failsafe: Middleware allowed us in based on a dead cookie.
      // We must forcefully purge the dead cookie and return to login.
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    const { data: progressData, error } = await supabase
      .from('progress')
      .select(`
        id,
        current_episode,
        duration_watched,
        notes,
        updated_at,
        seasons (
          id,
          season_number,
          content (
            id,
            title,
            type,
            status,
            total_episodes
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error || !progressData) {
      console.error("Fetch Data Error:", error);
      set({ loading: false });
      return;
    }

    // Safely parse joined graph
    const mapped: AnimeEntry[] = progressData.map((row: any) => {
      const season = row.seasons || {};
      const content = season.content || {};
      
      // Keep track of dynamically loaded completed series
      if (content.status === 'completed' && !get().completedSeries.includes(content.title)) {
        set((state) => ({ completedSeries: [...state.completedSeries, content.title] }));
      }

      return {
        id: row.id,
        anime_name: content.title || "Unknown",
        type: content.type || "anime",
        season: season.season_number || 1,
        total_episodes: content.total_episodes || null,
        episode: row.current_episode || 0,
        duration: row.duration_watched?.toString() || "0",
        notes: row.notes || "",
        status: content.status || 'watching',
        created_at: row.updated_at,
      };
    });

    set({ entries: mapped, loading: false });
  },

  addEntryAsync: async (data) => {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const userId = authData.user.id;

    // 1. Check or Insert Content
    let contentId = null;
    const { data: existingContent } = await supabase
      .from('content')
      .select('id')
      .eq('user_id', userId)
      .eq('title', data.anime_name)
      .single();

    if (existingContent) {
      contentId = existingContent.id;
    } else {
      const { data: newContent } = await supabase
        .from('content')
        .insert({
          user_id: userId,
          title: data.anime_name,
          type: data.type.toLowerCase(),
          total_episodes: parseInt(data.total_episodes) || null
        })
        .select().single();
      if (newContent) contentId = newContent.id;
    }

    if (!contentId) return;

    // 2. Check or Insert Season
    let seasonId = null;
    const sNum = parseInt(data.season) || 1;
    const { data: existingSeason } = await supabase
      .from('seasons')
      .select('id')
      .eq('content_id', contentId)
      .eq('season_number', sNum)
      .single();

    if (existingSeason) {
      seasonId = existingSeason.id;
    } else {
      const { data: newSeason } = await supabase
        .from('seasons')
        .insert({ content_id: contentId, season_number: sNum })
        .select().single();
      if (newSeason) seasonId = newSeason.id;
    }

    if (!seasonId) return;

    // 3. Insert Progress
    await supabase.from('progress').insert({
      season_id: seasonId,
      current_episode: parseInt(data.episode) || 0,
      duration_watched: String(data.duration || "0"),
      notes: (data as any).notes || ""
    });

    // Refresh store from cloud
    await get().fetchData();
  },

  deleteEntryAsync: async (progressId) => {
    const supabase = createClient();
    await supabase.from('progress').delete().eq('id', progressId);
    await get().fetchData();
  },

  editEntryAsync: async (progressId, data) => {
    const supabase = createClient();
    let updates: any = {
      current_episode: data.episode,
      duration_watched: data.duration,
      notes: data.notes || "",
      updated_at: new Date().toISOString()
    };

    if (data.season) {
      const { data: progRow, error } = await supabase.from('progress').select('season_id, seasons(content_id)').eq('id', progressId).single();
      if (progRow && (progRow as any).seasons && (progRow as any).seasons.content_id) {
        const contentId = (progRow as any).seasons.content_id;
        
        let seasonId = null;
        const { data: existingSeason } = await supabase.from('seasons').select('id').eq('content_id', contentId).eq('season_number', data.season).single();
        if (existingSeason) {
          seasonId = existingSeason.id;
        } else {
          const { data: newSeason } = await supabase.from('seasons').insert({ content_id: contentId, season_number: data.season }).select().single();
          if (newSeason) seasonId = newSeason.id;
        }

        if (seasonId) {
           updates.season_id = seasonId;
        }
      }
    }

    await supabase.from('progress').update(updates).eq('id', progressId);
    await get().fetchData();
  },

  markCompleted: async (anime_name) => {
    // Cloud Sync
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('content').update({ status: 'completed' }).eq('user_id', authData.user.id).eq('title', anime_name);
      await get().fetchData();
    }
  },

  markWatching: async (anime_name) => {
    // Cloud Sync
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('content').update({ status: 'watching' }).eq('user_id', authData.user.id).eq('title', anime_name);
      await get().fetchData();
    }
  },

  markWaiting: async (anime_name) => {
    // Cloud Sync
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('content').update({ status: 'waiting' }).eq('user_id', authData.user.id).eq('title', anime_name);
      await get().fetchData();
    }
  },

  updateType: async (anime_name, newType) => {
    // Cloud Sync
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('content').update({ type: newType.toLowerCase() }).eq('user_id', authData.user.id).eq('title', anime_name);
      await get().fetchData();
    }
  },

  updateTitle: async (oldTitle, newTitle) => {
    // Cloud Sync
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from('content').update({ title: newTitle }).eq('user_id', authData.user.id).eq('title', oldTitle);
      await get().fetchData();
    }
  },

  getWeeklyStreak: () => 2,

  getProgressList: () => {
    const { entries, completedSeries } = get();
    const map = new Map<string, AnimeProgress>();
    
    entries.forEach(entry => {
      if (!map.has(entry.anime_name)) {
        map.set(entry.anime_name, {
          anime_name: entry.anime_name,
          type: entry.type || "anime",
          latest_season: entry.season || 1,
          total_episodes: entry.episode,
          total_duration: entry.duration,
          last_watched: entry.created_at,
          status: entry.status as any
        });
      } else {
        const current = map.get(entry.anime_name)!;
        const entrySeason = entry.season || 1;
        
        // If we found a higher season context, adopt its episode definitively 
        if (entrySeason > current.latest_season) {
          current.latest_season = entrySeason;
          current.total_episodes = entry.episode;
        } 
        // If we are in the same highest season context, just take the highest episode
        else if (entrySeason === current.latest_season) {
          if (entry.episode > current.total_episodes) {
            current.total_episodes = entry.episode;
          }
        }
        
        // Summing duration strings
        const p1 = current.total_duration.split(':').map(Number);
        const p2 = entry.duration.split(':').map(Number);
        const m1 = p1[0] || 0; const s1 = p1[1] || 0;
        const m2 = p2[0] || 0; const s2 = p2[1] || 0;
        
        const totalSeconds = (m1 * 60 + s1) + (m2 * 60 + s2);
        const rm = Math.floor(totalSeconds / 60);
        const rs = totalSeconds % 60;
        current.total_duration = rs > 0 ? `${rm}:${rs.toString().padStart(2, '0')}` : `${rm}`;

        if (new Date(entry.created_at) > new Date(current.last_watched)) {
          current.last_watched = entry.created_at;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.last_watched).getTime() - new Date(a.last_watched).getTime());
  }
}));
