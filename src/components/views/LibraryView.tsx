import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { TrackCard } from '@/components/TrackCard';
import { WifiOff, Music, Download, Trash2 } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { toast } from 'sonner';

export const LibraryView = () => {
  const { cachedTracks, getCacheSize, removeFromCache } = useMusicStore();
  const totalDuration = cachedTracks.reduce((acc, track) => acc + track.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);
  const cacheSize = getCacheSize();

  const handleRemoveFromCache = (trackId: string, trackTitle: string) => {
    removeFromCache(trackId);
    toast.success('Video verwijderd uit offline', {
      description: `"${trackTitle}" is verwijderd uit je bibliotheek`,
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-40">
      <div className="flex justify-center">
        <AppLogo size="md" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <h1 className="text-3xl font-bold">Offline Bibliotheek</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Offline count - RED theme */}
          <span 
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
            style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)', color: 'hsl(0 72% 50%)' }}
          >
            <WifiOff className="h-4 w-4" />
            {cachedTracks.length} offline
          </span>
          {/* Duration */}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {totalMinutes} minuten
          </span>
          {/* Cache size */}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            {cacheSize} MB
          </span>
        </div>
      </motion.div>

      {/* Cached Tracks */}
      <div className="space-y-2">
        {cachedTracks.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-muted-foreground">Gedownloade video's</h2>
            </div>
            <div className="space-y-1">
              {cachedTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative"
                >
                  <TrackCard track={track} index={index} />
                  {/* Offline badge overlay */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                    style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)', color: 'hsl(0 72% 50%)' }}
                  >
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div 
              className="p-6 rounded-full mb-4"
              style={{ backgroundColor: 'hsl(0 72% 50% / 0.1)' }}
            >
              <Music className="h-12 w-12" style={{ color: 'hsl(0 72% 50%)' }} />
            </div>
            <h3 className="text-lg font-medium">Geen offline video's</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Download video's om ze offline te kunnen bekijken door op het download icoon te klikken
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
