import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMusicStore } from '@/store/musicStore';
import { 
  saveMediaFile, 
  getMediaDuration, 
  generateVideoThumbnail,
  LocalMediaFile 
} from '@/lib/mediaDB';
import { Track } from '@/types/music';
import { toast } from 'sonner';

const ACCEPTED_TYPES = '.mp3,.mp4,.m4a,.wav,.ogg,.webm,.aac';
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const FileUploadButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addLocalTrack } = useMusicStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is te groot`, {
            description: 'Maximum bestandsgrootte is 500MB'
          });
          errorCount++;
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
          toast.error(`${file.name} is geen geldig mediabestand`);
          errorCount++;
          continue;
        }

        // Get duration
        const duration = await getMediaDuration(file);
        if (duration === 0) {
          toast.error(`Kon ${file.name} niet laden`);
          errorCount++;
          continue;
        }

        // Generate thumbnail for videos
        let thumbnail = '';
        if (file.type.startsWith('video/')) {
          thumbnail = await generateVideoThumbnail(file);
        }

        // Create unique ID
        const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Parse title and artist from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        let title = nameWithoutExt;
        let artist = 'Lokaal bestand';

        // Try to parse "Artist - Title" format
        if (nameWithoutExt.includes(' - ')) {
          const parts = nameWithoutExt.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        // Save to IndexedDB
        const mediaFile: LocalMediaFile = {
          id,
          title,
          artist,
          duration,
          thumbnail,
          mimeType: file.type,
          blob: file,
          size: file.size,
          addedAt: new Date()
        };

        await saveMediaFile(mediaFile);

        // Add to store
        const track: Track = {
          id,
          title,
          artist,
          duration,
          thumbnail,
          isCached: true,
          cachedAt: new Date(),
          isLocal: true,
          mimeType: file.type,
          fileSize: file.size
        };

        addLocalTrack(track);
        successCount++;
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Fout bij uploaden van ${file.name}`);
        errorCount++;
      }
    }

    setIsUploading(false);
    
    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Show summary toast
    if (successCount > 0) {
      toast.success(`${successCount} bestand${successCount > 1 ? 'en' : ''} toegevoegd`, {
        description: 'Beschikbaar voor offline afspelen'
      });
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors disabled:opacity-50"
        style={{ 
          backgroundColor: 'hsl(0 72% 50% / 0.05)'
        }}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'hsl(0 72% 50%)' }} />
        ) : (
          <Upload className="h-6 w-6" style={{ color: 'hsl(0 72% 50%)' }} />
        )}
        <span className="font-medium">
          {isUploading ? 'Uploaden...' : 'Upload MP3/MP4 bestanden'}
        </span>
      </motion.button>
    </>
  );
};
