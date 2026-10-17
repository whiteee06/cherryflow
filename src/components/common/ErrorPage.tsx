import React from 'react';
import { CherryFlowLogo } from './CherryFlowLogo';
import { BRAND_CONFIG } from '../../config/brandConfig';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorPageProps {
  error?: Error | string;
  resetErrorBoundary?: () => void;
  onReturnHome?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  resetErrorBoundary,
  onReturnHome,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected application error occurred.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-rose-900/40 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        <CherryFlowLogo size="lg" showSubtitle={false} className="mx-auto mb-6" />

        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertTriangle size={28} />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          Oops!
        </h1>

        <h2 className="text-sm font-semibold text-rose-400 mb-3">
          Something went wrong.
        </h2>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs font-mono text-slate-300 mb-6 max-h-32 overflow-y-auto break-words">
          {errorMessage}
        </div>

        <div className="space-y-2.5">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <button
            onClick={onReturnHome || (() => window.location.reload())}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-800/80">
          {BRAND_CONFIG.copyright}
        </p>
      </div>
    </div>
  );
};
