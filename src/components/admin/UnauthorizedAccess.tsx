import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { CherryFlowLogo } from '../common/CherryFlowLogo';

interface UnauthorizedAccessProps {
  onGoToSuperAdminLogin: () => void;
  onReturnToWorkspace?: () => void;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  onGoToSuperAdminLogin,
  onReturnToWorkspace,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-rose-900/40 rounded-3xl p-8 text-center shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <CherryFlowLogo size="lg" showSubtitle={true} className="mx-auto mb-6" />

        {/* 403 Shield Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-lg shadow-rose-950/40">
          <ShieldAlert size={32} />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          HTTP 403 Forbidden
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Super Admin Privileges Required
        </h1>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Access to the Super Admin Control Center is strictly restricted to authorized Developer Super Admin credentials. Standard workspace accounts cannot access system administration.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoToSuperAdminLogin}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <LogIn className="w-4 h-4" />
            Sign in as Developer / Super Admin
          </button>

          {onReturnToWorkspace && (
            <button
              onClick={onReturnToWorkspace}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Workspace Dashboard
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-800/80">
          This unauthorized access attempt was logged for security monitoring.
        </p>
      </div>
    </div>
  );
};
