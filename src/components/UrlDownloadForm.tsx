import { useState } from 'react';
import { Link2, Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { 
  saveMediaFile, 
  getMediaDuration,
  LocalMediaFile 
} from '@/lib/mediaDB';
import { Track } from '@/types/music';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SUPPORTED_EXTENSIONS = ['.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.webm', '.aac'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const validateUrl = (url: string): { valid: boolean; error?: string } => {
  try {
    const parsed = new URL(url);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL moet beginnen met http:// of https://' };
    }
    
    // Check for supported file extension
    const pathname = parsed.pathname.toLowerCase();
    const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => pathname.endsWith(ext));
    
    if (!hasValidExtension) {
      return { valid: false, error: 'URL moet eindigen op .mp3, .mp4, .webm, etc.' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Ongeldige URL' };
  }
};

const getFilenameFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const filename = pathname.split('/').pop() || 'download';
    return decodeURIComponent(filename.replace(/\.[^/.]+$/, '')); // Remove extension
  } catch {
    return 'Gedownload bestand';
  }
};

const getMimeTypeFromUrl = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes('.mp3')) return 'audio/mpeg';
  if (lower.includes('.mp4')) return 'video/mp4';
  if (lower.includes('.webm')) return 'video/webm';
  if (lower.includes('.m4a')) return 'audio/mp4';
  if (lower.includes('.wav')) return 'audio/wav';
  if (lower.includes('.ogg')) return 'audio/ogg';
  if (lower.includes('.aac')) return 'audio/aac';
  return 'audio/mpeg';
};

export const UrlDownloadForm = () => {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { addLocalTrack } = useMusicStore();

  const handleDownload = async () => {
    setError(null);
    
    // Validate URL
    const validation = validateUrl(url.trim());
    if (!validation.valid) {
      setError(validation.error || 'Ongeldige URL');
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      // Fetch the file
      const response = await fetch(url.trim());
      
      if (!response.ok) {
        throw new Error(`Download mislukt (${response.status})`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('audio') && !contentType.includes('video')) {
        // Allow if URL has valid extension even if content-type is wrong
        const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => url.toLowerCase().includes(ext));
        if (!hasValidExt) {
          throw new Error('Bestand is geen audio of video');
        }
      }

      // Check file size from headers
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
        throw new Error('Bestand is te groot (max 500MB)');
      }

      // Read the response with progress
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Kan bestand niet lezen');
      }

      const totalSize = contentLength ? parseInt(contentLength) : 0;
      const chunks: BlobPart[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedSize += value.length;
        
        if (totalSize > 0) {
          setProgress(Math.round((receivedSize / totalSize) * 100));
        }
      }

      // Check actual file size
      if (receivedSize > MAX_FILE_SIZE) {
        throw new Error('Bestand is te groot (max 500MB)');
      }

      // Create blob
      const blob = new Blob(chunks, { type: getMimeTypeFromUrl(url) });
      
      // Create a File object to get duration
      const file = new File([blob], 'media', { type: blob.type });
      const duration = await getMediaDuration(file);
      
      if (duration === 0) {
        throw new Error('Kon media niet laden - mogelijk ongeldig formaat');
      }

      // Generate ID and metadata
      const id = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filename = getFilenameFromUrl(url);
      
      // Parse title and artist from filename
      let title = filename;
      let artist = 'Gedownload';
      
      if (filename.includes(' - ')) {
        const parts = filename.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Save to IndexedDB
      const mediaFile: LocalMediaFile = {
        id,
        title,
        artist,
        duration,
        thumbnail: '', // No thumbnail for URL downloads
        mimeType: blob.type || getMimeTypeFromUrl(url),
        blob,
        size: blob.size,
        addedAt: new Date()
      };

      await saveMediaFile(mediaFile);

      // Add to store
      const track: Track = {
        id,
        title,
        artist,
        duration,
        thumbnail: '',
        isCached: true,
        cachedAt: new Date(),
        isLocal: true,
        mimeType: blob.type,
        fileSize: blob.size
      };

      addLocalTrack(track);

      toast.success('Bestand gedownload!', {
        description: `"${title}" is beschikbaar voor offline afspelen`,
        icon: <Check className="h-4 w-4" />
      });

      // Clear form
      setUrl('');
      setProgress(0);
    } catch (err) {
      console.error('Download error:', err);
      const message = err instanceof Error ? err.message : 'Download mislukt';
      setError(message);
      toast.error('Download mislukt', { description: message });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link2 className="h-4 w-4" />
        <span>Of plak een directe media-URL:</span>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="url"
            placeholder="https://example.com/audio.mp3"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            disabled={isDownloading}
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <Button
          onClick={handleDownload}
          disabled={!url.trim() || isDownloading}
          style={{ backgroundColor: 'hsl(0 72% 50%)' }}
          className="hover:opacity-90"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Downloaden...</span>
              <span>{progress}%</span>
            </div>
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(0 72% 50% / 0.2)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'hsl(0 72% 50%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">
        Ondersteunde formaten: MP3, MP4, WebM, M4A, WAV, OGG, AAC
      </p>
    </motion.div>
  );
};
