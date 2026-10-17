import React, { useState } from 'react';
import {
  Users,
  Kanban,
  Bot,
  BarChart3,
  Zap,
  ShieldCheck,
  CreditCard,
  Bell,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Workflow,
  Globe,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingFeaturesProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingFeatures: React.FC<LandingFeaturesProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [activeModule, setActiveModule] = useState<string>('crm');

  const modules = [
    {
      id: 'crm',
      icon: Users,
      name: 'CRM & Pipeline',
      tagline: 'Close deals faster with unified context',
      description:
        'Track contacts, leads, and custom deal stages with full activity logs, email integrations, and intelligent probability scores.',
      highlights: [
        'Custom visual deal stages (Lead, Qualified, Proposal, Won)',
        'Detailed customer timeline history',
        'Automatic churn risk detection',
        'One-click export to CSV & JSON',
      ],
      stats: '4.8x higher lead conversion rate',
    },
    {
      id: 'tasks',
      icon: Kanban,
      name: 'Task Management',
      tagline: 'Kanban boards and sprint velocity',
      description:
        'Manage projects, assign owners, set priorities, track due dates, and streamline sprint backlogs in an ultra-responsive interface.',
      highlights: [
        'Drag-and-drop Kanban & List view options',
        'Priority tagging (Low, Medium, High, Urgent)',
        'Real-time status updates',
        'Subtask checklists and estimate tracking',
      ],
      stats: '62% reduction in project delays',
    },
    {
      id: 'copilot',
      icon: Bot,
      name: 'AI Assistant',
      tagline: 'Gemini-powered operations copilot',
      description:
        'Context-aware AI assistant that analyzes deal pipelines, generates meeting notes, drafts outreach emails, and builds custom automated workflows.',
      highlights: [
        'Powered by Google Gemini models',
        'Automated deal risk and sentiment analysis',
        'Instant note and report generation',
        'Natural language workflow creator',
      ],
      stats: 'Saved 14+ hours per user weekly',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      name: 'Analytics & Insights',
      tagline: 'Real-time revenue & task metrics',
      description:
        'Visualize key performance metrics including MRR growth, deal win rates, customer acquisition cost, and team completion velocity.',
      highlights: [
        'Interactive Recharts revenue charts',
        'Cohort retention and conversion breakdown',
        'Custom reporting period filters',
        'Exportable executive summaries',
      ],
      stats: '100% real-time data accuracy',
    },
    {
      id: 'automation',
      icon: Zap,
      name: 'Workflow Automation',
      tagline: 'Trigger-action operational rules',
      description:
        'Automate repetitive operational tasks. Set triggers based on deal stage shifts, high-priority tasks, or new customer creations.',
      highlights: [
        'Visual trigger-condition-action workflow builder',
        'Instant in-app or notification dispatch',
        'Auto-task creation and user assignments',
        'Execution history and retry logs',
      ],
      stats: 'Over 1.4M actions executed monthly',
    },
    {
      id: 'collaboration',
      icon: ShieldCheck,
      name: 'Team Collaboration',
      tagline: 'Multi-user workspaces & RBAC',
      description:
        'Invite teammates, assign granular role permissions (Owner, Admin, Member, Viewer), monitor real-time user presence, and log audit trails.',
      highlights: [
        'Workspace member invitation system',
        'Role-Based Access Control (RBAC)',
        'Live online/offline status indicators',
        'Comprehensive activity log history',
      ],
      stats: 'Zero-downtime permission management',
    },
    {
      id: 'billing',
      icon: CreditCard,
      name: 'Billing & Subscriptions',
      tagline: 'Stripe payments and plan usage',
      description:
        'Manage subscription plans, monitor seat counts, generate customer invoices, and track payment history directly inside the app.',
      highlights: [
        '5 Plan Tiers (Free, Starter, Pro, Business, Enterprise)',
        'Stripe payment gateway integration',
        'Automated monthly invoice receipts',
        'Seat and AI credit usage meters',
      ],
      stats: '$1.2B total transaction volume',
    },
    {
      id: 'notifications',
      icon: Bell,
      name: 'Notifications Engine',
      tagline: 'In-app drawer & category preferences',
      description:
        'Stay informed with real-time in-app notification drawers, unread badges, and customizable notification preference controls.',
      highlights: [
        'Slide-out notification drawer with read/unread filters',
        'Granular category toggles (Tasks, CRM, AI, Billing)',
        'Interactive quick actions inside alerts',
        'Email & push digest options',
      ],
      stats: 'Sub-100ms alert delivery rate',
    },
  ];

  const currentMod = modules.find((m) => m.id === activeModule) || modules[0];

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Eight Integrated Modules
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Everything Your Business Needs. <br />
            <span className="text-rose-600 dark:text-rose-500">Zero Fragmentation.</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Stop stitching together 6 different subscriptions. CherryFlow provides a single cohesive suite built with native speed and elegance.
          </p>
        </div>

        {/* Module Selector Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                id={`feature-module-tab-${mod.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Feature Detail Card */}
        <div className="bg-zinc-50 dark:bg-zinc-900/90 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Detail */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200/60 dark:border-rose-800/60">
              <currentMod.icon className="w-4 h-4" />
              <span>{currentMod.name}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {currentMod.tagline}
            </h3>

            <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed">
              {currentMod.description}
            </p>

            <ul className="space-y-3">
              {currentMod.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="p-1 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Proven Impact</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400">{currentMod.stats}</span>
              </div>

              <button
                onClick={onLaunchApp}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Try {currentMod.name} Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Graphic / Interactive Demo Container */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-400">MODULE_SPECS // {currentMod.id.toUpperCase()}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                Active & Live
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">CherryFlow Engine Status</span>
                <span className="text-xs font-mono text-rose-500">Sub-50ms latency</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full w-[94%]" />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Security: AES-256</span>
                <span>Uptime: 99.99%</span>
                <span>Status: Optimal</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Enhancement Active</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                All data in {currentMod.name} is automatically indexed and contextualized for instant AI queries, auto-summarization, and workflow automation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
