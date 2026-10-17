import React from 'react';
import { CherryFlowLogo } from './CherryFlowLogo';
import { BRAND_CONFIG } from '../../config/brandConfig';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        <CherryFlowLogo size="lg" showSubtitle={false} className="mx-auto mb-6" />

        <div className="text-6xl font-black text-rose-500 font-mono tracking-wider mb-2">
          404
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Page Not Found
        </h1>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The requested route or module does not exist in {BRAND_CONFIG.productName}. Please check the URL or navigate back to the workspace home.
        </p>

        <button
          onClick={onGoHome}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Home className="w-4 h-4" />
          Go Back Home
        </button>

        <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-800/80">
          {BRAND_CONFIG.copyright}
        </p>
      </div>
    </div>
  );
};
