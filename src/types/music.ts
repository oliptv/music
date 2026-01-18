export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  isCached: boolean;
  cachedAt?: Date;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
}

export interface CacheSettings {
  maxSizeGB: number;
  autoClean: boolean;
  wifiOnly: boolean;
  cleanOlderThanDays: number;
}
