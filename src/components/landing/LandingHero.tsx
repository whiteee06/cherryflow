import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
  ShieldCheck,
  Bot,
  BarChart3,
  Kanban,
  CreditCard,
  Bell,
  Layers,
  Star,
  ChevronRight,
  Check,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingHeroProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'crm' | 'tasks' | 'copilot' | 'analytics'>('crm');

  const customerLogos = [
    { name: 'Linear', label: 'Linear' },
    { name: 'Stripe', label: 'Stripe' },
    { name: 'Vercel', label: 'Vercel' },
    { name: 'Retool', label: 'Retool' },
    { name: 'Figma', label: 'Figma' },
    { name: 'Supabase', label: 'Supabase' },
    { name: 'Raycast', label: 'Raycast' },
    { name: 'Notion', label: 'Notion' },
  ];

  const valueProps = [
    'No credit card required',
    'Free 14-day trial on Pro',
    'Setup in 2 minutes',
    'Cancel anytime',
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated Glowing Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-amber-500/15 blur-3xl pointer-events-none rounded-full animate-pulse duration-1000" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-rose-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Eyebrow Badge */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => onTabChange('ai')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-all cursor-pointer shadow-sm group"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Announcing CherryFlow AI Copilot V1 with Gemini 2.5</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            One Engine to Run Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Entire Operating System
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace CRM, task management, team collaboration, billing, and AI assistants with one fast, unified workspace designed for modern growth teams.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchApp}
              id="hero-start-free-btn"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 hover:shadow-rose-600/40 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('features')}
              id="hero-explore-features-btn"
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span>Explore Features</span>
            </button>
          </div>

          {/* Value props list */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-rose-500" />
                <span>{prop}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive App Mockup Frame */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-2 sm:p-4 relative">
            {/* Window control dots */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-zinc-400 ml-2">cherryflow.app/workspace</span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg">
                <button
                  onClick={() => setActivePreviewTab('crm')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activePreviewTab === 'crm'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  CRM Pipeline
                </button>
                <button
                  onClick={() => setActivePreviewTab('tasks')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activePreviewTab === 'tasks'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setActivePreviewTab('copilot')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activePreviewTab === 'copilot'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  AI Copilot
                </button>
                <button
                  onClick={() => setActivePreviewTab('analytics')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    activePreviewTab === 'analytics'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/60 rounded-xl mt-2">
              {activePreviewTab === 'crm' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">Active Customer Deals Pipeline</h4>
                      <p className="text-xs text-zinc-500">12 deals valued at $485,000</p>
                    </div>
                    <button
                      onClick={onLaunchApp}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                    >
                      Open Live CRM →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Lead Stage</span>
                        <span className="text-xs font-bold text-rose-500">$120k</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-xs">
                          <p className="font-semibold text-zinc-900 dark:text-white">Acme Corp Enterprise</p>
                          <p className="text-[10px] text-zinc-400">Owner: Sarah C. • 95% Match</p>
                        </div>
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg text-xs">
                          <p className="font-semibold text-zinc-900 dark:text-white">Starlight Media</p>
                          <p className="text-[10px] text-zinc-400">Owner: Alex R. • Lead</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Proposal Sent</span>
                        <span className="text-xs font-bold text-amber-500">$215k</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
                          <p className="font-semibold text-zinc-900 dark:text-white">Nexus Global</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">Contract under review</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Closed Won</span>
                        <span className="text-xs font-bold text-emerald-500">$150k</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs">
                          <p className="font-semibold text-zinc-900 dark:text-white">HyperScale Tech</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Onboarding scheduled</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'tasks' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-base">Sprint Kanban Board</h4>
                      <p className="text-xs text-zinc-500">Q3 Roadmap & Operational Sprints</p>
                    </div>
                    <span className="text-xs font-mono bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-1 rounded border border-rose-200 dark:border-rose-800">
                      84% Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">To Do (4)</span>
                      <p className="font-semibold mt-1 text-zinc-800 dark:text-zinc-200">Prepare SOC 2 Audit</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">In Progress (3)</span>
                      <p className="font-semibold mt-1 text-zinc-800 dark:text-zinc-200">Stripe Billing Webhook</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">In Review (2)</span>
                      <p className="font-semibold mt-1 text-zinc-800 dark:text-zinc-200">Gemini Prompt Tuning</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Done (12)</span>
                      <p className="font-semibold mt-1 text-zinc-800 dark:text-zinc-200">Workspace Auth V2</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'copilot' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-sm flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-600 text-white flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-white">Cherry AI Assistant</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        "I noticed deal <span className="font-semibold text-rose-500">Nexus Global ($215k)</span> has been stagnant for 6 days. I drafted a personalized follow-up email and created a reminder task for Sarah."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'analytics' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">MRR Growth</span>
                      <p className="text-lg font-bold text-emerald-500">$48,200 (+24%)</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Task Velocity</span>
                      <p className="text-lg font-bold text-rose-500">142 items/wk</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active Seats</span>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">38 Members</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-20 pt-10 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Trusted by fast-scaling operations & revenue teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all">
            {customerLogos.map((logo, i) => (
              <span
                key={i}
                className="font-bold text-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-tight"
              >
                {logo.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
