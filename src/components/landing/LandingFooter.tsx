import React, { useState } from 'react';
import { CherryFlowLogo } from '../common/CherryFlowLogo';
import {
  Cherry,
  Send,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  Heart,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingFooterProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 pt-16 pb-12 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-rose-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800">
          {/* Column 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <CherryFlowLogo size="lg" showSubtitle={true} />
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              The unified operations workspace that replaces disjointed CRM, tasks, AI, and billing tools with a single fast, beautiful engine.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-2">
                Subscribe to Product Updates & Insights
              </h4>
              {subscribed ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>Thanks for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email..."
                    required
                    id="newsletter-email-input"
                    className="flex-1 bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="submit"
                    id="newsletter-submit-btn"
                    className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center cursor-pointer shadow-md shadow-rose-600/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onTabChange('features')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Features & Modules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('pricing')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('ai')}
                  className="hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>AI Copilot</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-1.5 py-0.2 rounded border border-rose-500/30">
                    Gemini
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('solutions')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Solutions
                </button>
              </li>
              <li>
                <button
                  onClick={onLaunchApp}
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Live App Demo</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onTabChange('about')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  About CherryFlow
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('blog')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Blog & Articles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('contact')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('help')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Security */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Legal & Trust
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onTabChange('privacy')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('terms')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <span className="text-zinc-500 text-xs block">SOC 2 Type II Certified</span>
              </li>
              <li>
                <span className="text-zinc-500 text-xs block">GDPR & CCPA Compliant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational (99.99%)
            </span>
            <span>© 2026 CherryFlow Technologies. All Rights Reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-zinc-400 text-[11px]">
            <span>Founded & Developed by <strong className="text-white">Nithiarasu G</strong> (Founder & CEO)</span>
            <span>•</span>
            <span>Made with ❤️ in India</span>
            <span>•</span>
            <span className="font-mono text-rose-400 font-bold">v1.0.0</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <a href="https://github.com/nithiarasu" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com/cherryflow_app" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com/in/nithiarasu" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://youtube.com/@cherryflow" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
