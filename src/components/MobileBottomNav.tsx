import React from 'react';
import { LayoutDashboard, Users, CheckSquare, FileText, Building2 } from 'lucide-react';
import { ViewTab } from '../types';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  pendingTaskCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  pendingTaskCount,
}) => {
  const items = [
    { id: 'dashboard' as ViewTab, label: 'Home', icon: LayoutDashboard },
    { id: 'customers' as ViewTab, label: 'CRM', icon: Users },
    { id: 'tasks' as ViewTab, label: 'Tasks', icon: CheckSquare, badge: pendingTaskCount },
    { id: 'notes' as ViewTab, label: 'Notes', icon: FileText },
    { id: 'team' as ViewTab, label: 'Team', icon: Building2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 lg:hidden px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              isActive ? 'text-rose-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon size={18} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
