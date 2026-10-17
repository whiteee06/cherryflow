import React, { useState } from 'react';
import {
  Rocket,
  TrendingUp,
  Code2,
  Building2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingSolutionsProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingSolutions: React.FC<LandingSolutionsProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>('startups');

  const personas = [
    {
      id: 'startups',
      icon: Rocket,
      title: 'Founders & Startups',
      subtitle: 'Move fast without losing operational alignment',
      benefits: [
        'Unify CRM, tasks, and notes in one lean tool stack',
        'Auto-generate investor updates with Gemini AI',
        'Keep burn rate low with affordable team seats',
      ],
      quote: '"CherryFlow allowed our team of 6 to handle 3x deal volume without hiring extra ops staff."',
      author: 'Elena Rostova, CEO at ScaleVentures',
    },
    {
      id: 'sales',
      icon: TrendingUp,
      title: 'Sales & Revenue',
      subtitle: 'Close bigger deals with complete customer memory',
      benefits: [
        'Visual deal pipelines with automated stage movement',
        'Stripe payment link creation inside customer records',
        'AI email outreach drafts and activity logs',
      ],
      quote: '"We increased our pipeline velocity by 34% within 3 weeks of deploying CherryFlow."',
      author: 'Marcus Vance, VP Sales at CloudPeak',
    },
    {
      id: 'product',
      icon: Code2,
      title: 'Product & Engineering',
      subtitle: 'Bridge customer feedback directly to sprint backlogs',
      benefits: [
        'Kanban boards with subtask estimation and tags',
        'Connect feature requests from CRM deals to product tasks',
        'Real-time sprint velocity charts',
      ],
      quote: '"No more context switching between CRM and Jira. Everything flows in one place."',
      author: 'David Kim, CTO at Starlight Tech',
    },
    {
      id: 'ops',
      icon: Building2,
      title: 'Operations & HR',
      subtitle: 'Automate repetitive workflows and maintain audit trails',
      benefits: [
        'Trigger-action workflow rules for automated dispatch',
        'Role-Based Access Control (RBAC) and audit logs',
        'Unified billing and invoice management',
      ],
      quote: '"Our operational compliance overhead dropped by 50% with CherryFlow\'s audit logs."',
      author: 'Sarah Jenkins, Chief Operating Officer',
    },
  ];

  const current = personas.find((p) => p.id === selectedPersona) || personas[0];

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Tailored Solutions
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Built for How Your Team <br />
            <span className="text-rose-600 dark:text-rose-500">Actually Works</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Whether you are a 3-person seed startup or a 100-person growth team, CherryFlow adapts seamlessly to your operational workflow.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {personas.map((p) => {
            const Icon = p.icon;
            const isActive = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
                <h3 className="font-bold text-sm">{p.title}</h3>
              </button>
            );
          })}
        </div>

        {/* Selected Persona Detail Box */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {current.subtitle}
            </h3>

            <ul className="space-y-3">
              {current.benefits.map((b, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onLaunchApp}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started as {current.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-base italic leading-relaxed">
              {current.quote}
            </p>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-sm text-zinc-900 dark:text-white block">{current.author}</span>
              <span className="text-xs text-zinc-400">Verified CherryFlow Customer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
