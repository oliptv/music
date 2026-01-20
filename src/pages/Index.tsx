import { useState } from 'react';
import { SearchView } from '@/components/views/SearchView';
import { LibraryView } from '@/components/views/LibraryView';
import { FavoritesView } from '@/components/views/FavoritesView';
import { SettingsView } from '@/components/views/SettingsView';
import { BottomNav } from '@/components/BottomNav';
import { MiniPlayer } from '@/components/MiniPlayer';
import { FullPlayer } from '@/components/FullPlayer';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { LocalMediaPlayer } from '@/components/LocalMediaPlayer';
import { useMusicStore } from '@/store/musicStore';

type TabType = 'search' | 'library' | 'favorites' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const { playerState } = useMusicStore();
  const currentTrack = playerState.currentTrack;

  const renderView = () => {
    switch (activeTab) {
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'favorites':
        return <FavoritesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SearchView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Player - YouTube for YouTube tracks, Local for local files */}
      {currentTrack?.isLocal ? <LocalMediaPlayer /> : <YouTubePlayer />}
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {renderView()}
      </main>

      <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
      <FullPlayer 
        isOpen={isPlayerOpen} 
        onClose={() => setIsPlayerOpen(false)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;