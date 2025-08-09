import { User, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabValue = 'dados' | 'preferencias' | 'seguranca';

interface Tab {
  id: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  {
    id: 'dados',
    label: 'Dados',
    icon: User,
  },
  {
    id: 'preferencias',
    label: 'Preferências',
    icon: Settings,
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    icon: Shield,
  },
];

interface ProfileTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const handleKeyDown = (event: React.KeyboardEvent, tabId: TabValue) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      onTabChange(tabs[prevIndex].id);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      onTabChange(tabs[nextIndex].id);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onTabChange(tabs[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      onTabChange(tabs[tabs.length - 1].id);
    }
  };

  return (
    <div className="border-b border-border">
      <nav 
        className="flex space-x-8 px-6"
        role="tablist"
        aria-label="Configurações do perfil"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`
                flex items-center gap-2 px-0 py-4 border-b-2 transition-colors
                ${isActive 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }
              `}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}