import { create } from 'zustand';
import { Track, PlayerState, CacheSettings } from '@/types/music';

// Mock data for demonstration
const mockTracks: Track[] = [
  { id: '1', title: 'Midnight Dreams', artist: 'Aurora Beats', duration: 234, thumbnail: '', isCached: true, cachedAt: new Date() },
  { id: '2', title: 'Electric Sunrise', artist: 'Neon Wave', duration: 198, thumbnail: '', isCached: true, cachedAt: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Ocean Waves', artist: 'Calm Collective', duration: 312, thumbnail: '', isCached: false },
  { id: '4', title: 'City Lights', artist: 'Urban Echo', duration: 267, thumbnail: '', isCached: true, cachedAt: new Date(Date.now() - 172800000) },
  { id: '5', title: 'Forest Rain', artist: 'Nature Sounds', duration: 445, thumbnail: '', isCached: false },
  { id: '6', title: 'Cosmic Journey', artist: 'Space Ambient', duration: 389, thumbnail: '', isCached: true, cachedAt: new Date(Date.now() - 259200000) },
];

interface MusicStore {
  // Player state
  playerState: PlayerState;
  setCurrentTrack: (track: Track | null) => void;
  togglePlayPause: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  
  // Library
  tracks: Track[];
  cachedTracks: Track[];
  searchResults: Track[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchTracks: (query: string) => void;
  
  // Cache management
  cacheSettings: CacheSettings;
  updateCacheSettings: (settings: Partial<CacheSettings>) => void;
  removeFromCache: (trackId: string) => void;
  clearOldCache: () => void;
  getCacheSize: () => number;
  
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
  },
  
  setCurrentTrack: (track) => set((state) => ({
    playerState: { ...state.playerState, currentTrack: track, isPlaying: true, progress: 0 }
  })),
  
  togglePlayPause: () => set((state) => ({
    playerState: { ...state.playerState, isPlaying: !state.playerState.isPlaying }
  })),
  
  setProgress: (progress) => set((state) => ({
    playerState: { ...state.playerState, progress }
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
  tracks: mockTracks,
  cachedTracks: mockTracks.filter(t => t.isCached),
  searchResults: [],
  searchQuery: '',
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchTracks: (query) => set((state) => {
    if (!query.trim()) {
      return { searchResults: [] };
    }
    const results = state.tracks.filter(
      t => t.title.toLowerCase().includes(query.toLowerCase()) ||
           t.artist.toLowerCase().includes(query.toLowerCase())
    );
    return { searchResults: results };
  }),
  
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
  
  removeFromCache: (trackId) => set((state) => ({
    tracks: state.tracks.map(t => 
      t.id === trackId ? { ...t, isCached: false, cachedAt: undefined } : t
    ),
    cachedTracks: state.cachedTracks.filter(t => t.id !== trackId),
  })),
  
  clearOldCache: () => set((state) => {
    const cutoff = Date.now() - (state.cacheSettings.cleanOlderThanDays * 24 * 60 * 60 * 1000);
    const updatedTracks = state.tracks.map(t => {
      if (t.cachedAt && new Date(t.cachedAt).getTime() < cutoff) {
        return { ...t, isCached: false, cachedAt: undefined };
      }
      return t;
    });
    return {
      tracks: updatedTracks,
      cachedTracks: updatedTracks.filter(t => t.isCached),
    };
  }),
  
  getCacheSize: () => {
    const cached = get().cachedTracks;
    // Simulate ~5MB per track
    return cached.length * 5;
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
    if (!currentTrack) return;
    
    const allTracks = state.tracks;
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
    
    const allTracks = state.tracks;
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? allTracks.length - 1 : currentIndex - 1;
    state.setCurrentTrack(allTracks[prevIndex]);
  },
}));
