import React, { useState, useEffect } from 'react';
import { CherryFlowLogo } from '../common/CherryFlowLogo';
import {
  Cherry,
  Sun,
  Moon,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Search,
  ShieldCheck,
  Code,
  Gauge,
  Layers,
} from 'lucide-react';
import { ThemeMode } from '../../types';

export type LandingPageTab =
  | 'home'
  | 'features'
  | 'pricing'
  | 'ai'
  | 'solutions'
  | 'about'
  | 'blog'
  | 'contact'
  | 'help'
  | 'privacy'
  | 'terms';

interface LandingHeaderProps {
  activeTab: LandingPageTab;
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenAuditModal: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  activeTab,
  onTabChange,
  onLaunchApp,
  theme,
  onToggleTheme,
  onOpenAuditModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: LandingPageTab; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'ai', label: 'AI Copilot', badge: 'Gemini' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'about', label: 'About' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
    { id: 'help', label: 'Help Center' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <CherryFlowLogo
            size="lg"
            showSubtitle={true}
            onClick={() => {
              onTabChange('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  id={`nav-link-${item.id}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/80 dark:bg-rose-950/30'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-rose-600 dark:bg-rose-500 rounded-full animate-in fade-in duration-200" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Audit / Test Suite Modal Trigger */}
            <button
              onClick={onOpenAuditModal}
              id="audit-suite-btn"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700/80"
              title="View SEO, Accessibility & Performance Audits"
            >
              <Gauge className="w-3.5 h-3.5 text-rose-500" />
              <span>SEO & Audit</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              id="landing-theme-toggle"
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Launch App Button */}
            <button
              onClick={onLaunchApp}
              id="launch-app-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-600/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="landing-mobile-menu-btn"
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAuditModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <Gauge className="w-4 h-4 text-rose-500" />
              <span>SEO, Performance & Accessibility Guide</span>
            </button>

            <button
              onClick={() => {
                onLaunchApp();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              <span>Launch App Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
