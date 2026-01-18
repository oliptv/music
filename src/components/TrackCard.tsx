import { Play, Plus, Wifi, WifiOff, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Track } from '@/types/music';
import { useMusicStore } from '@/store/musicStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { setCurrentTrack, addToQueue, removeFromCache, playerState } = useMusicStore();
  const isCurrentTrack = playerState.currentTrack?.id === track.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
        isCurrentTrack 
          ? 'glass-card glow-primary' 
          : 'hover:bg-secondary/60'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold gradient-text">
            {track.title.charAt(0)}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentTrack(track)}
          className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Play className="h-6 w-6 text-primary fill-primary" />
        </motion.button>
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate ${isCurrentTrack ? 'text-primary' : 'text-foreground'}`}>
          {track.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
      </div>

      {/* Duration & Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
        
        {/* Cache Status Indicator */}
        <div className="flex items-center">
          {track.isCached ? (
            <div className="flex items-center gap-1 text-primary" title="Beschikbaar offline">
              <WifiOff className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground" title="Streaming">
              <Wifi className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Add to Queue */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addToQueue(track)}
          className="p-2 rounded-full hover:bg-muted transition-colors md:opacity-0 md:group-hover:opacity-100"
          title="Toevoegen aan wachtrij"
        >
          <Plus className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </motion.button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-muted transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={() => addToQueue(track)}>
              <Plus className="h-4 w-4 mr-2" />
              Toevoegen aan wachtrij
            </DropdownMenuItem>
            {track.isCached && (
              <DropdownMenuItem 
                onClick={() => removeFromCache(track.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijderen uit cache
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
