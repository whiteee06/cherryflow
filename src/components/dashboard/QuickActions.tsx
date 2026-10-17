import React from 'react';
import { Building2, CheckSquare, FileText, Sparkles, Zap } from 'lucide-react';

interface QuickActionsProps {
  onOpenAddCustomer: () => void;
  onOpenAddTask: () => void;
  onOpenAddNote: () => void;
  onOpenAICopilot: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAddCustomer,
  onOpenAddTask,
  onOpenAddNote,
  onOpenAICopilot,
}) => {
  const actions = [
    {
      title: 'Add New Customer',
      subtitle: 'Log leads or client accounts',
      icon: Building2,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      onClick: onOpenAddCustomer,
    },
    {
      title: 'Create Business Task',
      subtitle: 'Assign priorities & due dates',
      icon: CheckSquare,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
      onClick: onOpenAddTask,
    },
    {
      title: 'New Strategy Note',
      subtitle: 'Document meetings & plans',
      icon: FileText,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      onClick: onOpenAddNote,
    },
    {
      title: 'Launch AI Copilot',
      subtitle: 'Smart insights & auto-drafting',
      icon: Sparkles,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
      onClick: onOpenAICopilot,
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Quick Business Actions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${act.color}`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 shadow-xs group-hover:scale-110 transition-transform">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{act.title}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{act.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
