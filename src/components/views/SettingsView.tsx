import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMusicStore } from '@/store/musicStore';
import { HardDrive, Wifi, Trash2, Clock, Info, Youtube } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';

export const SettingsView = () => {
  const { cacheSettings, updateCacheSettings, getCacheSize, clearOldCache } = useMusicStore();
  const cacheSize = getCacheSize();
  const maxSizeMB = cacheSettings.maxSizeGB * 1024;
  const usagePercent = (cacheSize / maxSizeMB) * 100;

  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    try {
      setYoutubeApiKey(localStorage.getItem('youtubeApiKey') || '');
    } catch {
      // ignore
    }
  }, []);

  const saveYoutubeKey = () => {
    try {
      const next = youtubeApiKey.trim();
      if (next) localStorage.setItem('youtubeApiKey', next);
      else localStorage.removeItem('youtubeApiKey');

      setKeySaved(true);
      window.setTimeout(() => setKeySaved(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-40">
      <div className="flex justify-center">
        <AppLogo size="md" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold">Instellingen</h1>
      </motion.div>

      {/* Cache Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <HardDrive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Cache Opslag</h2>
            <p className="text-sm text-muted-foreground">Beheer je offline opslag</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Gebruikt: {cacheSize} MB</span>
            <span>Limiet: {maxSizeMB} MB</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-cache-loading rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            0 nummers opgeslagen
          </p>
        </div>

        {/* Cache Limit Slider */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Cache limiet</Label>
            <span className="text-primary font-medium">{maxSizeMB} MB</span>
          </div>
          <Slider
            value={[cacheSettings.maxSizeGB]}
            min={0.1}
            max={2}
            step={0.1}
            onValueChange={(value) => updateCacheSettings({ maxSizeGB: value[0] })}
            className="w-full [&_[role=slider]]:bg-cache-loading [&_.bg-primary]:bg-cache-loading"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 MB</span>
            <span>2 GB</span>
          </div>
        </div>
      </motion.div>

      {/* Auto Clean Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Clock className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Automatisch Opschonen</h2>
            <p className="text-sm text-muted-foreground">Verwijder oude bestanden</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <Label htmlFor="auto-clean" className="text-foreground">
              Automatisch opschonen
            </Label>
            <p className="text-sm text-muted-foreground">
              Verwijder oude cache automatisch
            </p>
          </div>
          <Switch
            id="auto-clean"
            checked={cacheSettings.autoClean}
            onCheckedChange={(checked) => updateCacheSettings({ autoClean: checked })}
          />
        </div>

        <Button
          variant="outline"
          onClick={clearOldCache}
          className="w-full h-12 border-border hover:bg-muted"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Oude bestanden nu verwijderen
        </Button>
      </motion.div>

      {/* Streaming Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Wifi className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Streaming</h2>
            <p className="text-sm text-muted-foreground">Data voorkeuren</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <Label htmlFor="wifi-only" className="text-foreground">
              Alleen via Wi-Fi streamen
            </Label>
            <p className="text-sm text-muted-foreground">
              Bespaar mobiele data
            </p>
          </div>
          <Switch
            id="wifi-only"
            checked={cacheSettings.wifiOnly}
            onCheckedChange={(checked) => updateCacheSettings({ wifiOnly: checked })}
          />
        </div>
      </motion.div>

      {/* YouTube API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Youtube className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">YouTube</h2>
            <p className="text-sm text-muted-foreground">Stel je eigen API key in</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube-api-key" className="text-foreground">
            YouTube Data API key
          </Label>
          <Input
            id="youtube-api-key"
            value={youtubeApiKey}
            onChange={(e) => setYoutubeApiKey(e.target.value)}
            placeholder="Plak je API key hier (optioneel)"
          />
          <p className="text-xs text-muted-foreground">Leeg laten = standaard key gebruiken.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={saveYoutubeKey} className="h-12">
            Opslaan
          </Button>
          {keySaved && <span className="text-sm text-muted-foreground">Opgeslagen</span>}
        </div>
      </motion.div>

      {/* Offline Info */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)' }}
          >
            <Info className="h-6 w-6" style={{ color: 'hsl(0 72% 50%)' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Over Offline Modus</h2>
            <p className="text-sm text-muted-foreground">Hoe werkt het?</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
            <Youtube className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">YouTube Streaming</p>
              <p className="text-muted-foreground mt-1">
                Video's worden gestreamd via YouTube en vereisen een internetverbinding voor afspelen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
            <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Wat wordt opgeslagen?</p>
              <p className="text-muted-foreground mt-1">
                De download knop slaat video-informatie op (titel, artiest, thumbnail) zodat je je bibliotheek offline kunt bekijken.
              </p>
            </div>
          </div>

          <div 
            className="p-3 rounded-xl border"
            style={{ 
              backgroundColor: 'hsl(0 72% 50% / 0.05)', 
              borderColor: 'hsl(0 72% 50% / 0.3)' 
            }}
          >
            <p style={{ color: 'hsl(0 72% 50%)' }} className="font-medium">
              ⚠️ Let op
            </p>
            <p className="text-muted-foreground mt-1">
              Het afspelen van video's vereist altijd een internetverbinding. Dit is een beperking van YouTube.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};