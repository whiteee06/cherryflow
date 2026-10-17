import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, KeyRound, ShieldCheck, Check, AlertCircle, Sparkles, ArrowRight, LogOut } from 'lucide-react';

export const ForcePasswordChangePage: React.FC = () => {
  const { user, completePasswordChange, logout, error: authError } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = isMinLength && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await completePasswordChange(newPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
            <Sparkles size={14} /> First Time Account Activation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Set Your Permanent Password
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            You were added to the workspace using a temporary password. Please set a new password for <strong className="text-zinc-200">{user?.email}</strong>.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {(error || authError) && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Info Badge */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase">
                Temp Password
              </span>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                New Permanent Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Requirement Checks */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
              <div className={`flex items-center gap-2 ${isMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check size={14} className={isMinLength ? 'opacity-100' : 'opacity-30'} />
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${isMatching ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check size={14} className={isMatching ? 'opacity-100' : 'opacity-30'} />
                <span>Passwords match</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Update Password & Continue to App</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Logout Option */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
            <button
              onClick={() => logout()}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Log out & use a different account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
