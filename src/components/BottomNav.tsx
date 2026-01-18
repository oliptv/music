import { Search, Library, Settings, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'search' | 'library' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'search' as TabType, icon: Search, label: 'Zoeken' },
  { id: 'library' as TabType, icon: WifiOff, label: 'Offline' },
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
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
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
