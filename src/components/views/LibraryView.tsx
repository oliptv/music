import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { TrackCard } from '@/components/TrackCard';
import { WifiOff, Trash2, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LibraryView = () => {
  const { cachedTracks, clearOldCache, getCacheSize, cacheSettings } = useMusicStore();
  const cacheSize = getCacheSize();

  return (
    <div className="flex flex-col gap-6 pb-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <WifiOff className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Offline Bibliotheek</h1>
        </div>
        <p className="text-muted-foreground">
          Nummers die je zonder internet kunt afspelen
        </p>
      </motion.div>

      {/* Cache Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Cache gebruik</p>
              <p className="text-sm text-muted-foreground">
                {cacheSize} MB van {cacheSettings.maxSizeGB * 1024} MB
              </p>
            </div>
          </div>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${(cacheSize / (cacheSettings.maxSizeGB * 1024)) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <Button
          variant="outline"
          onClick={clearOldCache}
          className="flex-1 h-12 border-border hover:bg-muted"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Oude cache opschonen
        </Button>
      </motion.div>

      {/* Cached Tracks */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {cachedTracks.length} nummers in cache
        </p>

        {cachedTracks.length > 0 ? (
          <div className="space-y-1">
            {cachedTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Geen offline nummers</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Speel nummers af om ze automatisch op te slaan voor offline luisteren
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
