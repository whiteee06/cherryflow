import React, { useEffect, useState } from 'react';
import { CherryFlowLogo } from './CherryFlowLogo';
import { BRAND_CONFIG } from '../../config/brandConfig';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  minimumDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minimumDurationMs = 1500,
}) => {
  const [progress, setProgress] = useState(15);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, minimumDurationMs / 6);

    return () => clearInterval(interval);
  }, [minimumDurationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-8 select-none transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Spacer / Header Badge */}
      <div className="pt-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">{BRAND_CONFIG.companyName}</span>
        </div>
      </div>

      {/* Center Branding Content */}
      <div className="flex flex-col items-center text-center relative z-10 max-w-sm">
        <CherryFlowLogo size="2xl" variant="splash" showSubtitle={false} animated={true} className="mb-6" />

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          {BRAND_CONFIG.productName}
        </h1>

        <p className="text-base sm:text-lg font-medium text-rose-400/90 mb-6 tracking-wide">
          {BRAND_CONFIG.tagline}
        </p>

        {/* Progress Bar & Ring */}
        <div className="w-full max-w-xs space-y-3">
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Loading Application...
            </span>
            <span className="font-bold text-rose-400">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="pb-4 relative z-10 flex flex-col items-center gap-1 text-xs text-slate-400 font-medium">
        <span>Version {BRAND_CONFIG.versionNumber}</span>
        <span className="text-[11px] text-slate-400">{BRAND_CONFIG.copyright}</span>
      </div>
    </div>
  );
};
