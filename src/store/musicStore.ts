import { create } from 'zustand';
import { Track, PlayerState, CacheSettings } from '@/types/music';
import { searchYouTube } from '@/lib/youtube';
import { toast } from 'sonner';

interface MusicStore {
  // Player state
  playerState: PlayerState;
  setCurrentTrack: (track: Track | null) => void;
  togglePlayPause: () => void;
  setProgress: (progress: number) => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  clearSeekRequest: () => void;
  
  // Library
  tracks: Track[];
  cachedTracks: Track[];
  localTracks: Track[];
  favorites: Track[];
  searchResults: Track[];
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchTracks: (query: string) => Promise<void>;
  
  // Local files
  addLocalTrack: (track: Track) => void;
  removeLocalTrack: (trackId: string) => void;
  loadLocalTracks: (tracks: Track[]) => void;
  
  // Favorites
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  
  // Cache management
  cacheSettings: CacheSettings;
  updateCacheSettings: (settings: Partial<CacheSettings>) => void;
  addToCache: (track: Track) => void;
  removeFromCache: (trackId: string) => void;
  clearOldCache: () => void;
  getCacheSize: () => number;
  getLocalStorageSize: () => number;
  
  // Queue
  queue: Track[];
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // Player state
  playerState: {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 80,
    shuffle: false,
    repeat: 'off',
    seekRequested: undefined,
    isBuffering: false,
  },
  
  setCurrentTrack: (track) => set((state) => ({
    playerState: { ...state.playerState, currentTrack: track, isPlaying: true, progress: 0 }
  })),
  
  togglePlayPause: () => set((state) => ({
    playerState: { ...state.playerState, isPlaying: !state.playerState.isPlaying }
  })),
  
  setIsPlaying: (isPlaying) => set((state) => ({
    playerState: { ...state.playerState, isPlaying }
  })),
  
  setProgress: (progress) => set((state) => ({
    playerState: { ...state.playerState, progress }
  })),
  
  seekTo: (progress) => set((state) => ({
    playerState: { ...state.playerState, progress, seekRequested: progress }
  })),
  
  setIsBuffering: (isBuffering) => set((state) => ({
    playerState: { ...state.playerState, isBuffering }
  })),
  
  clearSeekRequest: () => set((state) => ({
    playerState: { ...state.playerState, seekRequested: undefined }
  })),
  
  setVolume: (volume) => set((state) => ({
    playerState: { ...state.playerState, volume }
  })),
  
  toggleShuffle: () => set((state) => ({
    playerState: { ...state.playerState, shuffle: !state.playerState.shuffle }
  })),
  
  cycleRepeat: () => set((state) => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(state.playerState.repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    return { playerState: { ...state.playerState, repeat: modes[nextIndex] } };
  }),
  
  // Library
  tracks: [],
  cachedTracks: [],
  localTracks: [],
  favorites: [],
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchTracks: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      const results = await searchYouTube(query);
      const cachedTracks = get().cachedTracks;
      
      const tracks: Track[] = results.map(result => {
        const cached = cachedTracks.find(t => t.id === result.id);
        return {
          id: result.id,
          title: result.title,
          artist: result.channelTitle,
          duration: result.duration,
          thumbnail: result.thumbnail,
          isCached: !!cached,
          cachedAt: cached?.cachedAt,
          youtubeId: result.id,
        };
      });
      
      set({ searchResults: tracks, isSearching: false });
    } catch (error) {
      console.error('Search error:', error);

      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('youtube:quotaExceeded')) {
        toast.error('YouTube quota overschreden', {
          description: 'Gebruik een API key uit een nieuw Google Cloud project, of wacht tot de quota reset.',
        });
      } else {
        toast.error('YouTube zoeken mislukt', {
          description: 'Controleer je API key en API restricties in Google Cloud Console.',
        });
      }

      set({ searchResults: [], isSearching: false });
    }
  },
  
  // Local files
  addLocalTrack: (track) => set((state) => {
    const isAlreadyAdded = state.localTracks.some(t => t.id === track.id);
    if (isAlreadyAdded) return state;
    return { localTracks: [...state.localTracks, track] };
  }),
  
  removeLocalTrack: (trackId) => set((state) => ({
    localTracks: state.localTracks.filter(t => t.id !== trackId)
  })),
  
  loadLocalTracks: (tracks) => set({ localTracks: tracks }),
  
  // Favorites
  addToFavorites: (track) => set((state) => {
    const isAlreadyFavorite = state.favorites.some(t => t.id === track.id);
    if (isAlreadyFavorite) return state;
    return { favorites: [...state.favorites, track] };
  }),
  
  removeFromFavorites: (trackId) => set((state) => ({
    favorites: state.favorites.filter(t => t.id !== trackId)
  })),
  
  isFavorite: (trackId) => get().favorites.some(t => t.id === trackId),
  
  // Cache management
  cacheSettings: {
    maxSizeGB: 2,
    autoClean: true,
    wifiOnly: false,
    cleanOlderThanDays: 30,
  },
  
  updateCacheSettings: (settings) => set((state) => ({
    cacheSettings: { ...state.cacheSettings, ...settings }
  })),
  
  addToCache: (track) => set((state) => {
    const isAlreadyCached = state.cachedTracks.some(t => t.id === track.id);
    if (isAlreadyCached) return state;
    
    const cachedTrack = { ...track, isCached: true, cachedAt: new Date() };
    return {
      cachedTracks: [...state.cachedTracks, cachedTrack],
      searchResults: state.searchResults.map(t => 
        t.id === track.id ? cachedTrack : t
      ),
    };
  }),
  
  removeFromCache: (trackId) => set((state) => ({
    cachedTracks: state.cachedTracks.filter(t => t.id !== trackId),
    searchResults: state.searchResults.map(t => 
      t.id === trackId ? { ...t, isCached: false, cachedAt: undefined } : t
    ),
  })),
  
  clearOldCache: () => set((state) => {
    const cutoff = Date.now() - (state.cacheSettings.cleanOlderThanDays * 24 * 60 * 60 * 1000);
    return {
      cachedTracks: state.cachedTracks.filter(t => 
        t.cachedAt && new Date(t.cachedAt).getTime() >= cutoff
      ),
    };
  }),
  
  getCacheSize: () => {
    const cached = get().cachedTracks;
    // Simulate ~5MB per track
    return cached.length * 5;
  },
  
  getLocalStorageSize: () => {
    const local = get().localTracks;
    return local.reduce((total, track) => total + (track.fileSize || 0), 0);
  },
  
  // Queue
  queue: [],
  
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),
  
  removeFromQueue: (trackId) => set((state) => ({
    queue: state.queue.filter(t => t.id !== trackId)
  })),
  
  playNext: () => {
    const state = get();
    const currentTrack = state.playerState.currentTrack;
    
    // Check queue first
    if (state.queue.length > 0) {
      const nextTrack = state.queue[0];
      set({ queue: state.queue.slice(1) });
      state.setCurrentTrack(nextTrack);
      return;
    }
    
    if (!currentTrack) return;
    
    const allTracks = state.searchResults.length > 0 ? state.searchResults : state.cachedTracks;
    if (allTracks.length === 0) return;
    
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id);
    
    if (state.playerState.shuffle) {
      const randomIndex = Math.floor(Math.random() * allTracks.length);
      state.setCurrentTrack(allTracks[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % allTracks.length;
      state.setCurrentTrack(allTracks[nextIndex]);
    }
  },
  
  playPrevious: () => {
    const state = get();
    const currentTrack = state.playerState.currentTrack;
    if (!currentTrack) return;
    
    const allTracks = state.searchResults.length > 0 ? state.searchResults : state.cachedTracks;
    if (allTracks.length === 0) return;
    
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? allTracks.length - 1 : currentIndex - 1;
    state.setCurrentTrack(allTracks[prevIndex]);
  },
}));
