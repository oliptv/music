import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { TrackCard } from '@/components/TrackCard';
import { Heart } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const FavoritesView = () => {
  const { favorites } = useMusicStore();

  return (
    <div className="flex flex-col gap-6 pb-40">
      <div className="flex justify-center">
        <AppLogo size="md" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold">Favorieten</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            <Heart className="h-4 w-4 inline-block mr-1" />
            {favorites.length} nummers
          </span>
        </div>
      </motion.div>

      {/* Favorites Tracks */}
      <div className="space-y-2">
        {favorites.length > 0 ? (
          <div className="space-y-1">
            {favorites.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="p-6 rounded-full bg-muted/50 mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Geen favorieten</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Voeg nummers toe aan je favorieten om ze hier te zien
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};