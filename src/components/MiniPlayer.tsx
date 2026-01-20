import { Play, Pause, SkipForward, WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';

interface MiniPlayerProps {
  onExpand: () => void;
}

export const MiniPlayer = ({ onExpand }: MiniPlayerProps) => {
  const { playerState, togglePlayPause, playNext } = useMusicStore();
  const { currentTrack, isPlaying, progress } = playerState;

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div 
          className="glass-card rounded-2xl p-3 cursor-pointer relative overflow-hidden"
          onClick={onExpand}
        >
          {/* Progress Bar Background - RED */}
          <div 
            className="absolute bottom-0 left-0 h-1 transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: 'hsl(0 72% 50%)' }}
          />

          <div className="flex items-center gap-3">
            {/* Album Art */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold gradient-text">
                  {currentTrack.title.charAt(0)}
                </span>
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                {currentTrack.isCached ? (
                  <WifiOff className="h-3 w-3 text-primary flex-shrink-0" />
                ) : (
                  <Wifi className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-primary text-primary-foreground"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <SkipForward className="h-5 w-5 text-foreground" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
