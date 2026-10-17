import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Cherry, MailCheck, RefreshCw, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

export const EmailVerifyNotice: React.FC = () => {
  const { pendingVerificationEmail, resendVerification, setScreen } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const msg = await resendVerification();
      setResendStatus(msg);
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <button
          onClick={() => setScreen('landing')}
          className="inline-flex items-center gap-2.5 group cursor-pointer mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200">
            <Cherry className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Cherry<span className="text-rose-500">Flow</span>
          </span>
        </button>

        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <MailCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white">Verify your email address</h2>
        <p className="mt-2 text-sm text-slate-400">
          We sent a confirmation link to{' '}
          <span className="text-rose-400 font-semibold">{pendingVerificationEmail || 'your email'}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800/80 space-y-5">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Next Steps</span>
            </div>
            <p>1. Open your inbox and click the CherryFlow verification link.</p>
            <p>2. Once confirmed, you will be redirected straight to your active workspace.</p>
          </div>

          {resendStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resendStatus}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Resending Token...' : 'Resend Verification Email'}</span>
            </button>

            <button
              onClick={() => setScreen('app')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-medium text-xs hover:from-rose-500 hover:to-rose-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <span>I Have Verified — Enter App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setScreen('login')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
