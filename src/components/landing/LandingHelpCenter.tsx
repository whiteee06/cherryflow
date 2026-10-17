import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  HelpCircle,
  Video,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Zap,
  Users,
  Bot,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingHelpCenterProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingHelpCenter: React.FC<LandingHelpCenterProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    { icon: Users, title: 'CRM & Pipeline', count: '12 articles' },
    { icon: Zap, title: 'Tasks & Sprints', count: '18 articles' },
    { icon: Bot, title: 'Gemini AI Copilot', count: '10 articles' },
    { icon: CreditCard, title: 'Billing & Stripe', count: '8 articles' },
    { icon: Shield, title: 'Security & RBAC', count: '6 articles' },
    { icon: BookOpen, title: 'Workflow Automations', count: '14 articles' },
  ];

  const faqs = [
    {
      q: 'How does CherryFlow replace multiple SaaS applications?',
      a: 'CherryFlow unifies CRM pipeline management, Kanban sprint boards, AI note-taking, Stripe invoicing, and team permissions into a single reactive interface, eliminating data silos and license fees.',
    },
    {
      q: 'Is my company data used to train public AI models?',
      a: 'No. CherryFlow utilizes private enterprise Gemini endpoints with strict zero-retention policies. Your workspace notes and CRM records remain 100% confidential.',
    },
    {
      q: 'Can I import my existing data from HubSpot, Notion, or Salesforce?',
      a: 'Yes! CherryFlow provides one-click CSV and JSON import wizards inside the Settings menu. You can bring contacts, deals, and task history over in minutes.',
    },
    {
      q: 'What happens if we exceed our plan limit?',
      a: 'We never lock you out. If you reach your AI credit or seat limit, you will receive an in-app notice with the option to upgrade or pay usage overage as needed.',
    },
    {
      q: 'Is there a free trial for the Professional plan?',
      a: 'Yes, all paid plans include a 14-day free trial with full feature access and no credit card required at sign-up.',
    },
  ];

  const videos = [
    { title: 'CherryFlow V1 Getting Started Walkthrough', duration: '4:12', views: '12.4k views' },
    { title: 'Setting Up Your First Gemini AI Workflow Rule', duration: '3:45', views: '8.9k views' },
    { title: 'Managing Stripe Invoices & Custom Billing Plans', duration: '2:50', views: '5.1k views' },
  ];

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Search Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Help Center & Knowledge Base
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            How Can We Help You Today?
          </h1>

          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, FAQs, API docs, or troubleshooting..."
              id="help-search-input"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-rose-500 shadow-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 text-center space-y-2 hover:border-rose-500 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{c.title}</h3>
                <span className="text-xs text-zinc-400 block">{c.count}</span>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-base flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Video Tutorials</h2>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold cursor-pointer">
              View All 24 Tutorials →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {videos.map((v, idx) => (
              <div
                key={idx}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 hover:border-rose-500 transition-colors cursor-pointer"
              >
                <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <Video className="w-8 h-8 text-rose-600" />
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono">
                    {v.duration}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{v.title}</h3>
                  <span className="text-xs text-zinc-400 block mt-1">{v.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
