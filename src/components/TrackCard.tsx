import { Play, Wifi, WifiOff, Heart, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Track } from '@/types/music';
import { useMusicStore } from '@/store/musicStore';

interface TrackCardProps {
  track: Track;
  index: number;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TrackCard = ({ track, index }: TrackCardProps) => {
  const { 
    setCurrentTrack, 
    playerState, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    addToCache 
  } = useMusicStore();
  const isCurrentTrack = playerState.currentTrack?.id === track.id;
  const trackIsFavorite = isFavorite(track.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trackIsFavorite) {
      removeFromFavorites(track.id);
    } else {
      addToFavorites(track);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCache(track);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => setCurrentTrack(track)}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        isCurrentTrack 
          ? 'glass-card glow-primary' 
          : 'hover:bg-secondary/60'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        {track.thumbnail ? (
          <img 
            src={track.thumbnail} 
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <span className="text-2xl font-bold gradient-text">
              {track.title.charAt(0)}
            </span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="h-6 w-6 text-primary fill-primary" />
        </motion.div>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold truncate ${isCurrentTrack ? 'text-primary' : 'text-foreground'}`}>
            {track.title}
          </h3>
          {/* Streaming indicator */}
          {track.isCached ? (
            <WifiOff className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Wifi className="h-4 w-4 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFavoriteClick}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title={trackIsFavorite ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
        >
          <Heart 
            className={`h-5 w-5 ${trackIsFavorite ? 'text-destructive fill-destructive' : 'text-muted-foreground hover:text-foreground'}`} 
          />
        </motion.button>

        {/* Download/Cache Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadClick}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title={track.isCached ? "In cache" : "Toevoegen aan bibliotheek"}
        >
          <Download 
            className={`h-5 w-5 ${track.isCached ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`} 
          />
        </motion.button>
      </div>
    </motion.div>
  );
};