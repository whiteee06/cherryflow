import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../config/brandConfig';
import { CherryFlowLogo } from './CherryFlowLogo';
import { ViewTab } from '../../types';
import {
  ShieldCheck,
  Heart,
  Mail,
  Headphones,
  BookOpen,
  Users,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: ViewTab) => void;
  onOpenLegalModal?: (modalType: 'privacy' | 'terms' | 'cookies' | 'refund' | 'security') => void;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenLegalModal,
  className = '',
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(BRAND_CONFIG.support.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <footer className={`bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-12 pb-8 px-4 sm:px-6 lg:px-8 font-sans ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-1 space-y-4">
            <CherryFlowLogo size="lg" showSubtitle={true} animated={false} />
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Helping businesses automate, organize, and grow with a unified AI-powered Business Operating System.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{BRAND_CONFIG.tagline}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {BRAND_CONFIG.quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab(link.tab as ViewTab)}
                    className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              {BRAND_CONFIG.legalLinks.map((legal) => (
                <li key={legal.label}>
                  <button
                    onClick={() => {
                      const type = legal.label.toLowerCase().includes('privacy')
                        ? 'privacy'
                        : legal.label.toLowerCase().includes('terms')
                        ? 'terms'
                        : legal.label.toLowerCase().includes('cookie')
                        ? 'cookies'
                        : legal.label.toLowerCase().includes('refund')
                        ? 'refund'
                        : 'security';
                      if (onOpenLegalModal) onOpenLegalModal(type);
                    }}
                    className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 group cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                    <span>{legal.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Support & Desk
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={handleCopyEmail}
                  className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2 group w-full text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span className="font-mono text-[11px]">{BRAND_CONFIG.support.email}</span>
                  {copiedEmail ? (
                    <Check className="w-3 h-3 text-emerald-400 ml-auto" />
                  ) : (
                    <span className="text-[10px] text-slate-600 group-hover:text-rose-400 ml-auto">Copy</span>
                  )}
                </button>
              </li>

              <li className="flex items-center gap-2 text-slate-400">
                <Headphones className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{BRAND_CONFIG.support.availability}</span>
              </li>

              <li>
                <a
                  href="#docs"
                  onClick={(e) => { e.preventDefault(); if (onNavigateTab) onNavigateTab('help' as ViewTab); }}
                  className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Developer Docs</span>
                </a>
              </li>

              <li>
                <a
                  href="#community"
                  onClick={(e) => { e.preventDefault(); if (onNavigateTab) onNavigateTab('team' as ViewTab); }}
                  className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>Community Hub</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Connect With Us
            </h4>

            <p className="text-xs text-slate-400">
              Follow official updates, release notes, and developer playbooks.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={BRAND_CONFIG.socials.github}
                target="_blank"
                rel="noreferrer"
                title="GitHub Repository"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>

              <a
                href={BRAND_CONFIG.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                title="LinkedIn Page"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <a
                href={BRAND_CONFIG.socials.instagram}
                target="_blank"
                rel="noreferrer"
                title="Instagram Handle"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-500/40 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={BRAND_CONFIG.socials.youtube}
                target="_blank"
                rel="noreferrer"
                title="YouTube Channel"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500/40 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href={BRAND_CONFIG.socials.twitter}
                target="_blank"
                rel="noreferrer"
                title="Twitter / X Profile"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/40 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Security & Compliance Banner */}
        <div className="py-3 px-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200">{BRAND_CONFIG.about.securityNotice}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <span>Supabase Storage</span>
            <span>•</span>
            <span>JWT Auth</span>
            <span>•</span>
            <span>RLS Enforced</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <span>{BRAND_CONFIG.copyright}</span>
          </div>

          {/* Founder & Location Attribution */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              Founded & Developed by{' '}
              <span className="font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300">
                {BRAND_CONFIG.founder.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({BRAND_CONFIG.founder.designation})</span>
            </span>

            <span className="text-slate-600">|</span>

            <span className="flex items-center gap-1 text-slate-300">
              {BRAND_CONFIG.madeWithLove}
            </span>

            <span className="text-slate-600">|</span>

            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-rose-400 font-bold">
              {BRAND_CONFIG.version}
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};
