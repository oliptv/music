export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  isCached: boolean;
  cachedAt?: Date;
  youtubeId?: string;
  // For local files
  isLocal?: boolean;
  localBlobUrl?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  seekRequested?: number;
  isBuffering?: boolean;
}

export interface CacheSettings {
  maxSizeGB: number;
  autoClean: boolean;
  wifiOnly: boolean;
  cleanOlderThanDays: number;
}
