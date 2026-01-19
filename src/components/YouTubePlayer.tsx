import { useEffect, useRef, useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';

interface YTPlayer {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
    disablekb: number;
    fs: number;
    modestbranding: number;
    playsinline: number;
  };
  events: {
    onReady: (event: YTPlayerEvent) => void;
    onStateChange: (event: YTPlayerEvent) => void;
  };
}

interface YTPlayerState {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
  BUFFERING: number;
}

declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  onReady?: () => void;
}

export const YouTubePlayer = ({ onReady }: YouTubePlayerProps) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    playerState, 
    setProgress, 
    setIsPlaying, 
    playNext,
    addToCache 
  } = useMusicStore();
  
  const { currentTrack, isPlaying, volume } = playerState;
  const progressIntervalRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    if (playerRef.current && currentTrack) {
      const currentTime = playerRef.current.getCurrentTime?.() || 0;
      const duration = playerRef.current.getDuration?.() || currentTrack.duration;
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        setProgress(progress);
      }
    }
  }, [currentTrack, setProgress]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = window.setInterval(updateProgress, 1000);
  }, [updateProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return;
    
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize player when track changes
  useEffect(() => {
    if (!currentTrack?.youtubeId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentTrack.youtubeId!);
        return;
      }

      if (!containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId: currentTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
            event.target.playVideo();
            onReady?.();
            startProgressTracking();
            
            // Add to cache when playing starts
            if (currentTrack && !currentTrack.isCached) {
              addToCache(currentTrack);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              stopProgressTracking();
              playNext();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopProgressTracking();
    };
  }, [currentTrack?.youtubeId]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.playVideo?.();
      } else {
        playerRef.current.pauseVideo?.();
      }
    } catch (e) {
      // Player not ready yet
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!playerRef.current) return;
    
    try {
      playerRef.current.setVolume?.(volume);
    } catch (e) {
      // Player not ready yet
    }
  }, [volume]);

  return (
    <div 
      ref={containerRef} 
      className="fixed -top-[9999px] -left-[9999px] w-0 h-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
};
