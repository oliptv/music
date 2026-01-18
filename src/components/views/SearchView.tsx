import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { SearchBar } from '@/components/SearchBar';
import { TrackCard } from '@/components/TrackCard';
import { Music } from 'lucide-react';

export const SearchView = () => {
  const { searchResults, searchQuery, tracks } = useMusicStore();

  const displayTracks = searchQuery.trim() ? searchResults : tracks;

  return (
    <div className="flex flex-col gap-6 pb-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold gradient-text">StreamCache</h1>
        <p className="text-muted-foreground">Ontdek en cache je favoriete muziek</p>
      </motion.div>

      <SearchBar />

      <div className="space-y-2">
        {searchQuery.trim() && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {searchResults.length} resultaten voor "{searchQuery}"
          </motion.p>
        )}

        {displayTracks.length > 0 ? (
          <div className="space-y-1">
            {displayTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Music className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Geen resultaten</h3>
            <p className="text-muted-foreground mt-1">
              Probeer een andere zoekopdracht
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
