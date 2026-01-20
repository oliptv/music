import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

export const SearchBar = () => {
  const { searchQuery, setSearchQuery, searchTracks } = useMusicStore();
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    searchTracks(debouncedQuery);
  }, [debouncedQuery, searchTracks]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Zoek naar nummers, artiesten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-12 text-lg bg-secondary border-none rounded-2xl placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-2"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
