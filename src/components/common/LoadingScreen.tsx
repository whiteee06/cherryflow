import React from 'react';
import { CherryFlowLogo } from './CherryFlowLogo';
import { BRAND_CONFIG } from '../../config/brandConfig';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Application...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none font-sans">
      {/* Animated CherryFlow Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
        <CherryFlowLogo size="xl" variant="loading" showSubtitle={false} animated={false} />
      </div>

      <div className="flex items-center gap-2 mb-2 font-bold text-slate-100 text-lg">
        <span>{BRAND_CONFIG.productName}</span>
      </div>

      <p className="text-xs text-rose-400 font-semibold mb-4 tracking-wide">
        {BRAND_CONFIG.tagline}
      </p>

      {/* Loading Spinner Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
        <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-[11px]">{message}</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="min-h-[300px] flex items-center justify-center">{content}</div>;
};
