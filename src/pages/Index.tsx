import { useState } from 'react';
import { SearchView } from '@/components/views/SearchView';
import { LibraryView } from '@/components/views/LibraryView';
import { SettingsView } from '@/components/views/SettingsView';
import { BottomNav } from '@/components/BottomNav';
import { MiniPlayer } from '@/components/MiniPlayer';
import { FullPlayer } from '@/components/FullPlayer';

type TabType = 'search' | 'library' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const renderView = () => {
    switch (activeTab) {
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SearchView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-6">
        {renderView()}
      </main>

      <MiniPlayer onExpand={() => setIsPlayerOpen(true)} />
      <FullPlayer isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
