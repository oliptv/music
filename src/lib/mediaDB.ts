// IndexedDB utility for storing local media files

const DB_NAME = 'StreamCacheMediaDB';
const DB_VERSION = 1;
const MEDIA_STORE = 'media';

export interface LocalMediaFile {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  mimeType: string;
  blob: Blob;
  size: number;
  addedAt: Date;
}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
      }
    };
  });
  
  return dbPromise;
};

export const saveMediaFile = async (file: LocalMediaFile): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.put(file);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getMediaFile = async (id: string): Promise<LocalMediaFile | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readonly');
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllMediaFiles = async (): Promise<LocalMediaFile[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readonly');
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

export const deleteMediaFile = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getTotalStorageSize = async (): Promise<number> => {
  const files = await getAllMediaFiles();
  return files.reduce((total, file) => total + file.size, 0);
};

export const clearAllMedia = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MEDIA_STORE, 'readwrite');
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Helper to extract audio duration from file
export const getMediaDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = file.type.startsWith('video/') 
      ? document.createElement('video')
      : document.createElement('audio');
    
    media.preload = 'metadata';
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(media.duration || 0);
    };
    media.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    media.src = url;
  });
};

// Helper to generate thumbnail from video
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve('');
      return;
    }
    
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadeddata = () => {
      video.currentTime = Math.min(video.duration * 0.25, 5); // Seek to 25% or 5 seconds
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } else {
        URL.revokeObjectURL(url);
        resolve('');
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    
    video.src = url;
  });
};
