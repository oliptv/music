import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { TrackCard } from '@/components/TrackCard';
import { WifiOff, Music, Download, HardDrive } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { FileUploadButton } from '@/components/FileUploadButton';
import { toast } from 'sonner';
import { deleteMediaFile, getAllMediaFiles } from '@/lib/mediaDB';
import { useEffect } from 'react';
import { Track } from '@/types/music';

export const LibraryView = () => {
  const { 
    cachedTracks, 
    localTracks,
    getCacheSize, 
    getLocalStorageSize,
    removeFromCache,
    removeLocalTrack,
    loadLocalTracks
  } = useMusicStore();

  // Load local tracks from IndexedDB on mount
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const mediaFiles = await getAllMediaFiles();
        const tracks: Track[] = mediaFiles.map(file => ({
          id: file.id,
          title: file.title,
          artist: file.artist,
          duration: file.duration,
          thumbnail: file.thumbnail,
          isCached: true,
          cachedAt: file.addedAt,
          isLocal: true,
          mimeType: file.mimeType,
          fileSize: file.size
        }));
        loadLocalTracks(tracks);
      } catch (error) {
        console.error('Error loading local tracks:', error);
      }
    };
    loadFromDB();
  }, [loadLocalTracks]);

  const totalDuration = [...cachedTracks, ...localTracks].reduce((acc, track) => acc + track.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);
  const cacheSize = getCacheSize();
  const localSize = getLocalStorageSize();
  const totalSizeMB = cacheSize + Math.round(localSize / (1024 * 1024));

  const handleRemoveFromCache = (trackId: string, trackTitle: string) => {
    removeFromCache(trackId);
    toast.success('Video verwijderd uit offline', {
      description: `"${trackTitle}" is verwijderd uit je bibliotheek`,
    });
  };

  const handleRemoveLocalTrack = async (trackId: string, trackTitle: string) => {
    try {
      await deleteMediaFile(trackId);
      removeLocalTrack(trackId);
      toast.success('Bestand verwijderd', {
        description: `"${trackTitle}" is verwijderd uit je bibliotheek`,
      });
    } catch (error) {
      toast.error('Kon bestand niet verwijderen');
    }
  };

  const allTracks = [...localTracks, ...cachedTracks];

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
          {/* Local files count - GREEN theme */}
          {localTracks.length > 0 && (
            <span 
              className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
              style={{ backgroundColor: 'hsl(142 72% 40% / 0.2)', color: 'hsl(142 72% 40%)' }}
            >
              <HardDrive className="h-4 w-4" />
              {localTracks.length} lokaal
            </span>
          )}
          {/* Offline count - RED theme */}
          {cachedTracks.length > 0 && (
            <span 
              className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
              style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)', color: 'hsl(0 72% 50%)' }}
            >
              <WifiOff className="h-4 w-4" />
              {cachedTracks.length} YouTube
            </span>
          )}
          {/* Duration */}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {totalMinutes} minuten
          </span>
          {/* Total size */}
          <span className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            {totalSizeMB} MB
          </span>
        </div>
      </motion.div>

      {/* Upload Section */}
      <div className="space-y-4">
        <FileUploadButton />
      </div>

      {/* All Tracks */}
      <div className="space-y-2">
        {allTracks.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-muted-foreground">
                {localTracks.length > 0 && cachedTracks.length > 0 
                  ? 'Alle bestanden' 
                  : localTracks.length > 0 
                    ? 'Lokale bestanden'
                    : 'YouTube video\'s'}
              </h2>
            </div>
            <div className="space-y-1">
              {allTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative"
                >
                  <TrackCard track={track} index={index} />
                  {/* Badge overlay */}
                  <div 
                    className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                    style={track.isLocal 
                      ? { backgroundColor: 'hsl(142 72% 40% / 0.2)', color: 'hsl(142 72% 40%)' }
                      : { backgroundColor: 'hsl(0 72% 50% / 0.2)', color: 'hsl(0 72% 50%)' }
                    }
                  >
                    {track.isLocal ? (
                      <>
                        <HardDrive className="h-3 w-3" />
                        Lokaal
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        YouTube
                      </>
                    )}
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
            <h3 className="text-lg font-medium">Geen offline bestanden</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Upload je eigen MP3/MP4 bestanden of download YouTube video-info voor offline
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
