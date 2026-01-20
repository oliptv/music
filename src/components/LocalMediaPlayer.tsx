import { useEffect, useRef, useCallback } from 'react';
import { useMusicStore } from '@/store/musicStore';
import { getMediaFile } from '@/lib/mediaDB';

export const LocalMediaPlayer = () => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    playerState, 
    setProgress, 
    setIsPlaying,
    setIsBuffering,
    clearSeekRequest,
    playNext 
  } = useMusicStore();
  
  const { currentTrack, isPlaying, volume, seekRequested } = playerState;
  const progressIntervalRef = useRef<number | null>(null);
  const currentBlobUrl = useRef<string | null>(null);

  const updateProgress = useCallback(() => {
    if (mediaRef.current && currentTrack) {
      const currentTime = mediaRef.current.currentTime || 0;
      const duration = mediaRef.current.duration || currentTrack.duration;
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
    progressIntervalRef.current = window.setInterval(updateProgress, 500);
  }, [updateProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cleanup blob URL
  const cleanupBlobUrl = useCallback(() => {
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }
  }, []);

  // Load local media when track changes
  useEffect(() => {
    if (!currentTrack?.isLocal) {
      cleanupBlobUrl();
      return;
    }

    const loadLocalMedia = async () => {
      try {
        setIsBuffering(true);
        const mediaFile = await getMediaFile(currentTrack.id);
        
        if (!mediaFile) {
          console.error('Media file not found in IndexedDB:', currentTrack.id);
          setIsBuffering(false);
          return;
        }

        cleanupBlobUrl();
        const blobUrl = URL.createObjectURL(mediaFile.blob);
        currentBlobUrl.current = blobUrl;

        // Create appropriate media element
        const isVideo = mediaFile.mimeType.startsWith('video/');
        
        if (mediaRef.current) {
          mediaRef.current.pause();
          mediaRef.current.remove();
        }

        const media = isVideo 
          ? document.createElement('video')
          : document.createElement('audio');
        
        media.src = blobUrl;
        media.volume = volume / 100;
        media.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 0; height: 0;';
        
        media.onloadeddata = () => {
          setIsBuffering(false);
          media.play().catch(console.error);
          startProgressTracking();
        };

        media.onplay = () => {
          setIsPlaying(true);
          startProgressTracking();
        };

        media.onpause = () => {
          setIsPlaying(false);
          stopProgressTracking();
        };

        media.onended = () => {
          stopProgressTracking();
          playNext();
        };

        media.onerror = () => {
          console.error('Error playing local media');
          setIsBuffering(false);
        };

        containerRef.current?.appendChild(media);
        mediaRef.current = media;
      } catch (error) {
        console.error('Error loading local media:', error);
        setIsBuffering(false);
      }
    };

    loadLocalMedia();

    return () => {
      stopProgressTracking();
      cleanupBlobUrl();
    };
  }, [currentTrack?.id, currentTrack?.isLocal]);

  // Handle play/pause
  useEffect(() => {
    if (!mediaRef.current || !currentTrack?.isLocal) return;
    
    try {
      if (isPlaying) {
        mediaRef.current.play().catch(console.error);
      } else {
        mediaRef.current.pause();
      }
    } catch (e) {
      console.error('Error toggling playback:', e);
    }
  }, [isPlaying, currentTrack?.isLocal]);

  // Handle volume changes
  useEffect(() => {
    if (!mediaRef.current) return;
    mediaRef.current.volume = volume / 100;
  }, [volume]);

  // Handle seek requests
  useEffect(() => {
    if (seekRequested === undefined || !mediaRef.current || !currentTrack?.isLocal) return;
    
    try {
      const duration = mediaRef.current.duration || currentTrack.duration;
      const seekTime = (seekRequested / 100) * duration;
      mediaRef.current.currentTime = seekTime;
      clearSeekRequest();
    } catch (e) {
      console.error('Error seeking:', e);
    }
  }, [seekRequested, currentTrack, clearSeekRequest]);

  // Only render if current track is local
  if (!currentTrack?.isLocal) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed -top-[9999px] -left-[9999px] w-0 h-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
};
