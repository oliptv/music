import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { Settings, HardDrive, Wifi, Trash2, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export const SettingsView = () => {
  const { cacheSettings, updateCacheSettings, getCacheSize } = useMusicStore();
  const cacheSize = getCacheSize();

  return (
    <div className="flex flex-col gap-6 pb-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Instellingen</h1>
        </div>
        <p className="text-muted-foreground">
          Beheer je cache en streaming voorkeuren
        </p>
      </motion.div>

      {/* Cache Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 space-y-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Cache Beheer</h2>
        </div>

        {/* Cache Size Limit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="cache-limit" className="text-foreground">
              Maximale cache grootte
            </Label>
            <span className="text-primary font-medium">{cacheSettings.maxSizeGB} GB</span>
          </div>
          <Slider
            id="cache-limit"
            value={[cacheSettings.maxSizeGB]}
            min={0.5}
            max={10}
            step={0.5}
            onValueChange={(value) => updateCacheSettings({ maxSizeGB: value[0] })}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Huidige gebruik: {cacheSize} MB ({((cacheSize / (cacheSettings.maxSizeGB * 1024)) * 100).toFixed(1)}%)
          </p>
        </div>

        {/* Auto Clean */}
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="auto-clean" className="text-foreground">
                Automatisch opschonen
              </Label>
              <p className="text-sm text-muted-foreground">
                Verwijder automatisch oude cache
              </p>
            </div>
          </div>
          <Switch
            id="auto-clean"
            checked={cacheSettings.autoClean}
            onCheckedChange={(checked) => updateCacheSettings({ autoClean: checked })}
          />
        </div>

        {/* Clean Older Than */}
        {cacheSettings.autoClean && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <Label className="text-foreground">Verwijder ouder dan</Label>
              </div>
              <span className="text-primary font-medium">{cacheSettings.cleanOlderThanDays} dagen</span>
            </div>
            <Slider
              value={[cacheSettings.cleanOlderThanDays]}
              min={7}
              max={90}
              step={1}
              onValueChange={(value) => updateCacheSettings({ cleanOlderThanDays: value[0] })}
              className="w-full"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Streaming Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <Wifi className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Streaming</h2>
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

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground">StreamCache v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">
          Slimme muziekspeler met offline caching
        </p>
      </motion.div>
    </div>
  );
};
