import { Search, Library, Settings, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'search' | 'library' | 'favorites' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'search' as TabType, icon: Search, label: 'Zoeken' },
  { id: 'library' as TabType, icon: Library, label: 'Bibliotheek' },
  { id: 'favorites' as TabType, icon: Heart, label: 'Favorieten' },
  { id: 'settings' as TabType, icon: Settings, label: 'Instellingen' },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};