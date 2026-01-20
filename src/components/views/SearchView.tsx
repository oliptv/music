import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMusicStore } from '@/store/musicStore';
import { SearchBar } from '@/components/SearchBar';
import { TrackCard } from '@/components/TrackCard';
import { Music, Search as SearchIcon, MoreVertical, Key, Check } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const SearchView = () => {
  const { searchResults, searchQuery, isSearching, cachedTracks } = useMusicStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setApiKey(localStorage.getItem('youtubeApiKey') || '');
    } catch {}
  }, []);

  const saveKey = () => {
    try {
      const k = apiKey.trim();
      if (k) localStorage.setItem('youtubeApiKey', k);
      else localStorage.removeItem('youtubeApiKey');
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-6 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <AppLogo size="md" />
        <div className="flex-1 flex justify-end gap-2">
          <button 
            onClick={() => setShowApiKey(!showApiKey)}
            className={`p-2 rounded-full transition-colors ${showApiKey ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            title="YouTube API key"
          >
            <Key className="h-5 w-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showApiKey && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card rounded-xl p-4 space-y-3"
        >
          <p className="text-sm text-muted-foreground">YouTube API key (optioneel)</p>
          <div className="flex gap-2">
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Plak je API key hier..."
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={saveKey}>
              {saved ? <Check className="h-4 w-4 text-emerald-400" /> : <Key className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      )}

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