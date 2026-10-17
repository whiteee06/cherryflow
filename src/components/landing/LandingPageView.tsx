import React, { useState, useEffect } from 'react';
import { LandingHeader, LandingPageTab } from './LandingHeader';
import { LandingFooter } from './LandingFooter';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingPricing } from './LandingPricing';
import { LandingAIAssistant } from './LandingAIAssistant';
import { LandingSolutions } from './LandingSolutions';
import { LandingAbout } from './LandingAbout';
import { LandingBlog } from './LandingBlog';
import { LandingContact } from './LandingContact';
import { LandingHelpCenter } from './LandingHelpCenter';
import { LandingLegal } from './LandingLegal';
import { SeoAuditModal } from './SeoAuditModal';
import { LiveChatWidget } from './LiveChatWidget';
import { ThemeMode } from '../../types';
import { Sparkles, ArrowRight, X, Gift } from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchApp,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<LandingPageTab>('home');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [showExitOffer, setShowExitOffer] = useState(false);

  // Exit intent detector
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitOffer) {
        setShowExitOffer(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showExitOffer]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-rose-500 selection:text-white relative">
      {/* Top Fixed Header */}
      <LandingHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLaunchApp={onLaunchApp}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Main Page Router View */}
      <main className="min-h-[80vh]">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-300">
            <LandingHero onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
            <LandingFeatures onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
            <LandingPricing onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingFeatures onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingPricing onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingAIAssistant onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'solutions' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingSolutions onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingAbout onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingBlog />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingContact
              onTabChange={setActiveTab}
              onOpenLiveChat={() => setIsLiveChatOpen(true)}
            />
          </div>
        )}

        {activeTab === 'help' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingHelpCenter onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingLegal initialTab="privacy" />
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="animate-in fade-in duration-300 pt-16">
            <LandingLegal initialTab="terms" />
          </div>
        )}
      </main>

      {/* Sticky Bottom Conversion Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 text-white py-3 px-4 shadow-xl flex items-center justify-between text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold">Ready to supercharge your business operations?</span>
            <span className="text-zinc-400 hidden md:inline">• Free 14-day Pro trial. No credit card required.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('pricing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-zinc-300 hover:text-white font-medium underline text-xs cursor-pointer"
            >
              Compare Plans
            </button>
            <button
              onClick={onLaunchApp}
              id="sticky-conversion-launch-btn"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter onTabChange={setActiveTab} onLaunchApp={onLaunchApp} />

      {/* Exit Intent Modal */}
      {showExitOffer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl border border-rose-500/50 p-6 shadow-2xl space-y-4 text-center relative">
            <button
              onClick={() => setShowExitOffer(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md">
              <Gift className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              Wait! Claim 20% Off Your First Year
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Launch your CherryFlow workspace today and lock in our special launch pricing for life.
            </p>

            <button
              onClick={() => {
                setShowExitOffer(false);
                onLaunchApp();
              }}
              id="exit-intent-claim-btn"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              Claim 20% Off & Launch App →
            </button>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      <SeoAuditModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />

      {/* Live Chat Floating Widget */}
      <LiveChatWidget
        isOpen={isLiveChatOpen}
        onToggle={() => setIsLiveChatOpen(!isLiveChatOpen)}
        onLaunchApp={onLaunchApp}
      />
    </div>
  );
};
