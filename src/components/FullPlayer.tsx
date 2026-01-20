import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  WifiOff, 
  Wifi,
  ChevronDown,
  Volume2,
  MoreVertical,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FullPlayer = ({ isOpen, onClose }: FullPlayerProps) => {
  const { 
    playerState, 
    togglePlayPause, 
    playNext, 
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    setProgress,
    setVolume,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useMusicStore();
  
  const { currentTrack, isPlaying, progress, volume, shuffle, repeat } = playerState;
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  if (!currentTrack) return null;

  const currentTime = (localProgress / 100) * currentTrack.duration;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background"
          style={{ background: 'var(--gradient-player)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronDown className="h-6 w-6" />
            </motion.button>
            <div className="flex items-center gap-2">
              {currentTrack.isCached ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>Streaming</span>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <MoreVertical className="h-6 w-6" />
            </motion.button>
          </div>

          {/* Album Art */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden gradient-border ${
                isPlaying ? 'animate-pulse-glow' : ''
              }`}
            >
              {currentTrack.thumbnail ? (
                <img 
                  src={currentTrack.thumbnail} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                  <motion.span 
                    className="text-8xl font-bold gradient-text"
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    {currentTrack.title.charAt(0)}
                  </motion.span>
                </div>
              )}
              <div className="absolute inset-0 glow-primary opacity-50" />
            </motion.div>

            {/* Track Info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center max-w-md px-4"
            >
              <h2 className="text-2xl font-bold line-clamp-2">{currentTrack.title}</h2>
              <p className="text-lg text-muted-foreground mt-1 truncate">{currentTrack.artist}</p>
              
              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isFavorite(currentTrack.id)) {
                    removeFromFavorites(currentTrack.id);
                  } else {
                    addToFavorites(currentTrack);
                  }
                }}
                className="mt-4 p-3 rounded-full hover:bg-muted transition-colors"
                title={isFavorite(currentTrack.id) ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
              >
                <Heart 
                  className={`h-7 w-7 ${isFavorite(currentTrack.id) ? 'text-cache-loading fill-current' : 'text-muted-foreground hover:text-foreground'}`}
                  style={isFavorite(currentTrack.id) ? { color: 'hsl(0 72% 50%)', fill: 'hsl(0 72% 50%)' } : {}}
                />
              </motion.button>
            </motion.div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md mt-8"
            >
              <Slider
                value={[localProgress]}
                max={100}
                step={0.1}
                onValueChange={(value) => {
                  setLocalProgress(value[0]);
                  setProgress(value[0]);
                }}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleShuffle}
                className={`p-3 rounded-full transition-colors ${
                  shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shuffle className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPrevious}
                className="p-3 rounded-full hover:bg-muted transition-colors"
              >
                <SkipBack className="h-8 w-8" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="p-5 rounded-full bg-primary text-primary-foreground glow-primary"
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10" />
                ) : (
                  <Play className="h-10 w-10 ml-1" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="p-3 rounded-full hover:bg-muted transition-colors"
              >
                <SkipForward className="h-8 w-8" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={cycleRepeat}
                className={`p-3 rounded-full transition-colors ${
                  repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="h-6 w-6" />
                ) : (
                  <Repeat className="h-6 w-6" />
                )}
              </motion.button>
            </motion.div>

            {/* Volume */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mt-8 w-full max-w-xs"
            >
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
