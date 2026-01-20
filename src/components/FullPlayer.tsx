import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle,
  Repeat,
  Repeat1,
  WifiOff,
  ChevronDown,
  Heart,
  Download,
  Search,
  Library,
  Settings,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type TabType = 'search' | 'library' | 'favorites' | 'settings';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const navTabs = [
  { id: 'search' as TabType, icon: Search, label: 'Zoeken' },
  { id: 'library' as TabType, icon: Library, label: 'Bibliotheek' },
  { id: 'favorites' as TabType, icon: Heart, label: 'Favorieten' },
  { id: 'settings' as TabType, icon: Settings, label: 'Instellingen' },
];

export const FullPlayer = ({ isOpen, onClose, activeTab, onTabChange }: FullPlayerProps) => {
  const { 
    playerState, 
    togglePlayPause, 
    playNext, 
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    seekTo,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToCache
  } = useMusicStore();
  
  const { currentTrack, isPlaying, progress, shuffle, repeat, isBuffering } = playerState;
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
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              {/* Download/Cache button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentTrack.isCached) {
                    addToCache(currentTrack);
                    toast.success('Video opgeslagen voor offline', {
                      description: `"${currentTrack.title}" is nu beschikbaar zonder internet`,
                      icon: <Check className="h-4 w-4" />,
                    });
                  }
                }}
                className={`p-2 rounded-full transition-colors ${
                  currentTrack.isCached ? '' : 'hover:bg-muted'
                }`}
                title={currentTrack.isCached ? "Al opgeslagen voor offline" : "Opslaan voor offline"}
                disabled={currentTrack.isCached}
              >
                <Download 
                  className={`h-6 w-6 ${currentTrack.isCached ? '' : 'text-muted-foreground hover:text-foreground'}`}
                  style={currentTrack.isCached ? { color: 'hsl(0 72% 50%)' } : {}}
                />
              </motion.button>
              {/* Favorite button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFavorite(currentTrack.id)) {
                    removeFromFavorites(currentTrack.id);
                  } else {
                    addToFavorites(currentTrack);
                  }
                }}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title={isFavorite(currentTrack.id) ? "Verwijderen uit favorieten" : "Toevoegen aan favorieten"}
              >
                <Heart 
                  className={`h-6 w-6 ${isFavorite(currentTrack.id) ? '' : 'text-muted-foreground hover:text-foreground'}`}
                  style={isFavorite(currentTrack.id) ? { color: 'hsl(0 72% 50%)', fill: 'hsl(0 72% 50%)' } : {}}
                />
              </motion.button>
            </div>
          </div>

          {/* Video/Album Art Area */}
          <div className="flex-1 flex flex-col items-center justify-start px-4 pt-2 pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative w-full max-w-lg aspect-video rounded-2xl overflow-hidden ${
                isPlaying ? 'animate-pulse-glow' : ''
              }`}
              style={{ boxShadow: '0 0 30px hsl(0 72% 50% / 0.3)' }}
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
                    className="text-6xl font-bold gradient-text"
                    animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentTrack.title.charAt(0)}
                  </motion.span>
                </div>
              )}
            </motion.div>

            {/* Track Info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-center max-w-md px-4"
            >
              <h2 className="text-xl font-bold line-clamp-2">{currentTrack.title}</h2>
              <p className="text-base text-muted-foreground mt-1 truncate">{currentTrack.artist}</p>
            </motion.div>

            {/* Controls with Shuffle and Repeat */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-5 mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShuffle();
                }}
                className={`p-2 rounded-full transition-colors ${
                  shuffle ? '' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={shuffle ? { color: 'hsl(0 72% 50%)' } : {}}
              >
                <Shuffle className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  playPrevious();
                }}
                className="p-3 rounded-full hover:bg-muted transition-colors"
              >
                <SkipBack className="h-8 w-8" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="p-5 rounded-full text-primary-foreground"
                style={{ 
                  backgroundColor: 'hsl(0 72% 50%)',
                  boxShadow: '0 0 20px hsl(0 72% 50% / 0.6)'
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  playNext();
                }}
                className="p-3 rounded-full hover:bg-muted transition-colors"
              >
                <SkipForward className="h-8 w-8" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  cycleRepeat();
                }}
                className={`p-2 rounded-full transition-colors ${
                  repeat !== 'off' ? '' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={repeat !== 'off' ? { color: 'hsl(0 72% 50%)' } : {}}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="h-5 w-5" />
                ) : (
                  <Repeat className="h-5 w-5" />
                )}
              </motion.button>
            </motion.div>

            {/* Progress Bar - closer to controls */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-md px-4 mt-5"
            >
            {/* Time Display with Cache Indicator before time */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {/* Cache indicator before time - RED */}
                {currentTrack.isCached && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)', color: 'hsl(0 72% 50%)' }}
                  >
                    <WifiOff className="h-3 w-3" />
                  </div>
                )}
                {isBuffering && (
                  <motion.div 
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium animate-cache-pulse"
                    style={{ backgroundColor: 'hsl(0 72% 50% / 0.3)', color: 'hsl(0 72% 50%)' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  </motion.div>
                )}
                {/* Time - WHITE */}
                <span className="text-base font-bold text-white px-2 py-1 rounded bg-background/30">
                  {formatTime(currentTime)}
                </span>
              </div>
              {/* Duration - WHITE */}
              <span className="text-base font-bold text-white px-2 py-1 rounded bg-background/30">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
            
            {/* Progress Bar Track */}
            <div 
              className="relative h-3 w-full rounded-full overflow-visible cursor-pointer"
              style={{ backgroundColor: 'hsl(0 72% 50% / 0.3)' }}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                setLocalProgress(percentage);
                seekTo(percentage);
              }}
            >
              {/* Progress Fill */}
              <motion.div 
                className={`absolute top-0 left-0 h-full rounded-full ${isBuffering ? 'animate-cache-pulse' : ''}`}
                style={{ 
                  width: `${localProgress}%`,
                  backgroundColor: 'hsl(0 72% 50%)',
                  boxShadow: isBuffering ? '0 0 20px hsl(0 72% 50% / 0.9)' : '0 0 15px hsl(0 72% 50% / 0.7)'
                }}
              />
              
              {/* Progress Thumb */}
              <motion.div 
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white ${isBuffering ? 'animate-pulse' : ''}`}
                style={{ 
                  left: `calc(${localProgress}% - 10px)`,
                  backgroundColor: 'hsl(0 72% 50%)',
                  boxShadow: '0 0 15px hsl(0 72% 50% / 0.8)'
                }}
                whileHover={{ scale: 1.3 }}
              />
            </div>
          </motion.div>
          </div>

          {/* Bottom Navigation in Fullscreen */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Change tab and close fullscreen - audio keeps playing in background
                      onTabChange(tab.id);
                      onClose();
                    }}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                      isActive 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.div
                          layoutId="activeTabFullscreen"
                          className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
