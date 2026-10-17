import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, UserPlus, CheckSquare, FileText, Users, Settings } from 'lucide-react';

interface OnboardingCardProps {
  hasCustomers: boolean;
  hasTasks: boolean;
  hasNotes: boolean;
  hasTeam: boolean;
  hasSettings: boolean;
  onNavigateTab: (tab: any) => void;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  hasCustomers,
  hasTasks,
  hasNotes,
  hasTeam,
  hasSettings,
  onNavigateTab,
}) => {
  const steps = [
    {
      id: 'customers',
      label: 'Create your first customer',
      desc: 'Add contacts and track deals in your CRM pipeline',
      completed: hasCustomers,
      icon: UserPlus,
      actionTab: 'customers',
    },
    {
      id: 'tasks',
      label: 'Create your first task',
      desc: 'Organize team tasks, set priorities and due dates',
      completed: hasTasks,
      icon: CheckSquare,
      actionTab: 'tasks',
    },
    {
      id: 'notes',
      label: 'Create your first note',
      desc: 'Document meeting debriefs, playbooks and strategy',
      completed: hasNotes,
      icon: FileText,
      actionTab: 'notes',
    },
    {
      id: 'team',
      label: 'Invite your team',
      desc: 'Collaborate with colleagues and assign workspace roles',
      completed: hasTeam,
      icon: Users,
      actionTab: 'team',
    },
    {
      id: 'settings',
      label: 'Configure your workspace',
      desc: 'Set business name, currency, and AI preferences',
      completed: hasSettings,
      icon: Settings,
      actionTab: 'settings',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-500/30 shadow-lg relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Sparkles size={16} />
            </span>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Workspace Onboarding</span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
            Welcome to CherryFlow! Let's get your workspace ready.
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Follow these essential steps to set up your business operations.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-sm flex items-center justify-center border border-rose-500/20">
            {progressPct}%
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">{completedCount} of 5 Completed</p>
            <div className="w-28 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => onNavigateTab(step.actionTab)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                step.completed
                  ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-80'
                  : 'bg-white dark:bg-zinc-900/90 border-rose-500/20 hover:border-rose-500/60 hover:shadow-md'
              }`}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle size={20} className="text-rose-400 group-hover:text-rose-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${step.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                    {step.label}
                  </span>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
