import React from 'react';
import {
  Users,
  Target,
  Award,
  Globe,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingAboutProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingAbout: React.FC<LandingAboutProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const teamMembers = [
    {
      name: 'Alex Rivera',
      role: 'Co-Founder & Chief Executive Officer',
      bio: 'Ex-Stripe Operations Lead. Passionate about eliminating SaaS clutter.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & Head of AI',
      bio: 'Former AI Research Scientist at DeepMind. Gemini integration architect.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    },
    {
      name: 'Marcus Vance',
      role: 'VP of Product Engineering',
      bio: 'Built real-time distributed backends at Vercel & Linear.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Customer Success',
      bio: 'Championing 99.9% CSAT and friction-free onboarding for 45,000+ teams.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    },
  ];

  const metrics = [
    { label: 'Active Workspaces', value: '45,000+' },
    { label: 'Volume Managed', value: '$1.2B+' },
    { label: 'Global Availability', value: '99.99%' },
    { label: 'CSAT Rating', value: '4.9/5' },
  ];

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            We are Building the <br />
            <span className="text-rose-600 dark:text-rose-500">Future of Work Operations</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            CherryFlow was founded on a simple realization: modern teams spend 40% of their day switching between disconnected SaaS tools. We set out to build one unified engine that does it all with lightning speed.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-zinc-50 dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          {metrics.map((m, idx) => (
            <div key={idx} className="text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-500">{m.value}</span>
              <span className="text-xs text-zinc-500 uppercase font-semibold block">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Our Guiding Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Relentless Simplicity</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We measure software quality by what we remove, not just what we add. Clutter is the enemy of velocity.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">AI as Co-Pilot</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Artificial intelligence shouldn't replace humans; it should supercharge their judgment and handle busywork automatically.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg">Enterprise Security</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Zero compromise on data privacy. AES-256 encryption at rest and TLS 1.3 in transit across all workspace tiers.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Leadership Team</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-rose-500 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-white">{member.name}</h4>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">{member.role}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
