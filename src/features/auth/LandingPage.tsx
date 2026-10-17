import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Cherry,
  Users,
  CheckCircle2,
  Brain,
  Bot,
  Zap,
  Lock,
  ArrowRight,
  ChevronRight,
  Star,
  Check,
  Building,
  Sparkles,
  Database,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setScreen } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setScreen('landing')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200">
              <Cherry className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Cherry<span className="text-rose-500">Flow</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-rose-400 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-rose-400 transition-colors">
              Security & Supabase
            </a>
            <a href="#pricing" className="hover:text-rose-400 transition-colors">
              Pricing
            </a>
            <button
              onClick={() => setScreen('setup_guide')}
              className="text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Integration Guide</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('login')}
              className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => setScreen('register')}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 rounded-xl shadow-lg shadow-rose-950/50 hover:shadow-rose-900/50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Next-Gen SaaS Business Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Run Your Entire Business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-rose-300">AI Intelligence & Speed</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Manage clients, tasks, strategy notes, and revenue growth from one unified platform. Powered by Supabase, Gemini AI, and real-time execution.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setScreen('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base shadow-xl shadow-rose-950/60 hover:shadow-rose-900/60 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setScreen('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In to Account</span>
            </button>
          </div>

          {/* Key metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            {[
              { label: 'Revenue Managed', val: '$4.2M+' },
              { label: 'Tasks Automated', val: '120,000+' },
              { label: 'Client Satisfaction', val: '99.4%' },
              { label: 'Uptime Guarantee', val: '99.99%' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-2xl font-bold text-white">{stat.val}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Preview Canvas Graphic */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-rose-950/20 bg-slate-900/90 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">app.cherryflow.io/dashboard</span>
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Workspace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Monthly Revenue</span>
                  <span className="text-emerald-400 font-semibold">+18.4%</span>
                </div>
                <p className="text-2xl font-bold text-white">$48,250</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[78%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Active CRM Prospects</span>
                  <span className="text-rose-400 font-semibold">24 Leads</span>
                </div>
                <p className="text-2xl font-bold text-white">42 Deals</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[62%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>AI Copilot Status</span>
                  <span className="text-xs text-rose-400 font-medium">Ready</span>
                </div>
                <p className="text-2xl font-bold text-white">Gemini 2.5</p>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[95%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Four Core Pillars
            </h2>
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              Everything Your Agency or Startup Needs to Scale
            </p>
            <p className="mt-3 text-slate-400 text-sm">
              Built ground-up with modular features for customer management, tasks, strategic notes, and executive AI guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Smart CRM Hub',
                desc: 'Track customer pipelines, deal values, lead statuses, contact history, and draft personalized AI outreach instantly.',
              },
              {
                icon: BarChart3,
                title: 'Kanban Task Engine',
                desc: 'Manage priorities, subtasks, due dates, and auto-generate AI step-by-step task execution plans.',
              },
              {
                icon: Brain,
                title: 'Strategy Knowledge Notes',
                desc: 'Pin strategic ideas, client meeting notes, financial goals, and let Gemini summarize key takeaways.',
              },
              {
                icon: Bot,
                title: 'Executive AI Copilot',
                desc: 'Context-aware AI business consultant that analyzes your active metrics, clients, and tasks in real-time.',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Supabase Architecture Section */}
      <section id="architecture" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                  <Database className="w-3.5 h-3.5" />
                  <span>PostgreSQL & Supabase Auth</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
                  Enterprise-Grade Security & Row Level Protection
                </h2>
                <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                  CherryFlow provides seamless dual-mode authentication: full production integration with Supabase Cloud Auth (JWT, email verification, password reset, RLS) and an instant offline sandbox mode for immediate testing.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    'Supabase Auth with JWT and auto session refresh',
                    'Row Level Security (RLS) ensuring strict multi-tenant isolation',
                    'Encrypted credentials and secret keys stored server-side',
                    'Role-based access control (Owner, Admin, Member)',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setScreen('setup_guide')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Read Supabase Integration Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>supabase/migrations/01_auth_schema.sql</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <pre className="text-slate-400 overflow-x-auto p-2 bg-slate-900/60 rounded-lg text-[11px] leading-relaxed">
{`-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own business data"
  ON customers FOR ALL
  USING (auth.uid() = user_id);`}
                </pre>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>RLS Policy Verified & Ready for Deployment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
              Simple Transparent Pricing
            </h2>
            <p className="text-3xl font-extrabold text-white sm:text-4xl">
              Choose the Operating Tier For Your Scale
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-6 inline-flex items-center gap-3 p-1 rounded-full bg-slate-900 border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Annual (20% Off)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter Tier',
                desc: 'Perfect for freelancers & solo operators.',
                price: billingCycle === 'annual' ? '$19' : '$24',
                features: [
                  'Up to 100 Customers in CRM',
                  'Kanban Task Boards & Subtasks',
                  'Unlimited Strategy Notes',
                  'Standard AI Prompts',
                  'Single User Account',
                ],
                popular: false,
              },
              {
                name: 'Pro Operating System',
                desc: 'Ideal for growing agencies & startups.',
                price: billingCycle === 'annual' ? '$49' : '$59',
                features: [
                  'Unlimited CRM Contacts & Deals',
                  'Full AI Copilot Advisor (Gemini 2.5)',
                  'Automated AI Outreach Drafting',
                  'Role Access (Owner & Admins)',
                  'Supabase RLS Cloud Sync',
                  'Priority Support',
                ],
                popular: true,
              },
              {
                name: 'Enterprise Scale',
                desc: 'For multi-team organizations.',
                price: billingCycle === 'annual' ? '$119' : '$149',
                features: [
                  'Unlimited Team Members',
                  'Dedicated Supabase Database Instance',
                  'Custom AI Workflows & Models',
                  'Custom API & Webhooks',
                  '24/7 SLA & Dedicated Manager',
                ],
                popular: false,
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? 'bg-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-950/40 relative transform hover:-translate-y-1'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mb-6">{tier.desc}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setScreen('register')}
                  className={`w-full py-3 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                    tier.popular
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  Start Free 14-Day Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Cherry className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">CherryFlow V1</span>
            <span>— AI Business Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setScreen('login')} className="hover:text-slate-300 cursor-pointer">
              Sign In
            </button>
            <button onClick={() => setScreen('register')} className="hover:text-slate-300 cursor-pointer">
              Register
            </button>
            <button onClick={() => setScreen('setup_guide')} className="hover:text-slate-300 cursor-pointer">
              Integration Guide
            </button>
          </div>

          <p>© 2026 CherryFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
