import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { SearchBar } from '@/components/SearchBar';
import { TrackCard } from '@/components/TrackCard';
import { Music, Search as SearchIcon, MoreVertical } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export const SearchView = () => {
  const { searchResults, searchQuery, isSearching, cachedTracks } = useMusicStore();

  return (
    <div className="flex flex-col gap-6 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <AppLogo size="md" />
        <div className="flex-1 flex justify-end">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      <SearchBar />

      <div className="space-y-2">
        {searchQuery.trim() && !isSearching && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {searchResults.length} resultaten van YouTube
          </motion.p>
        )}

        {isSearching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-16 w-16 rounded-full border-4 border-cache-loading/30 border-t-cache-loading animate-spin mb-4" style={{ borderTopColor: 'hsl(0 72% 50%)' }} />
            <p className="text-muted-foreground">Zoeken op YouTube...</p>
          </motion.div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((track, index) => (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Zoek naar muziek</h3>
            <p className="text-muted-foreground mt-1">
              Typ een artiest, nummer of album om te beginnen
            </p>
            {cachedTracks.length > 0 && (
              <p className="text-sm text-primary mt-4">
                Je hebt {cachedTracks.length} nummers in je bibliotheek
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};