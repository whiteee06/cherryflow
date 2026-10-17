import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeamService } from '../../services/TeamService';
import { WorkspaceInvitation } from '../../types';
import { CherryFlowLogo } from '../../components/common/CherryFlowLogo';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Building2, User, Mail, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

interface AcceptInvitationPageProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AcceptInvitationPage: React.FC<AcceptInvitationPageProps> = ({
  token,
  onSuccess,
  onCancel,
}) => {
  const { setScreen } = useAuth();
  const [invitation, setInvitation] = useState<WorkspaceInvitation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    async function loadToken() {
      setLoading(true);
      setError(null);
      try {
        const res = await TeamService.getInvitationByToken(token);
        if (res.error || !res.invitation) {
          setError(res.error || 'Invalid or expired invitation token.');
        } else {
          setInvitation(res.invitation);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load invitation details.');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadToken();
    } else {
      setError('Missing invitation token.');
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await TeamService.acceptInvitation({
        token,
        password,
        name: invitation.name || invitation.email.split('@')[0],
      });

      setJoinSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to join workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'manager':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'employee':
      case 'member':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <CherryFlowLogo size="lg" />
          </div>
          <p className="text-xs font-medium text-zinc-400">Team Member Workspace Invitation</p>
        </div>

        {/* Loading Card */}
        {loading && (
          <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl text-center space-y-4 shadow-2xl">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">Validating workspace invitation token...</p>
          </div>
        )}

        {/* Error Card */}
        {!loading && error && !invitation && (
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-rose-500/30 backdrop-blur-xl space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Invitation Unavailable</h2>
              <p className="text-xs text-zinc-400">{error}</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setScreen('login')}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Go to CherryFlow Login
              </button>
              <button
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Success Card */}
        {joinSuccess && (
          <div className="p-8 rounded-3xl bg-zinc-950/90 border border-emerald-500/40 backdrop-blur-xl text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Welcome to the Team!</h2>
              <p className="text-xs text-zinc-300">
                You have successfully joined <span className="font-bold text-emerald-400">{invitation?.workspaceName}</span>.
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">Redirecting to workspace dashboard...</p>
          </div>
        )}

        {/* Invitation Acceptance Form */}
        {!loading && invitation && !joinSuccess && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl space-y-6 shadow-2xl">
            {/* Header / Invited By */}
            <div className="space-y-3 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Team Workspace Invitation
              </div>
              <h1 className="text-xl font-bold text-white leading-snug">
                You&apos;re invited to join <span className="text-rose-500">{invitation.workspaceName || 'CherryFlow Workspace'}</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Invited by <strong className="text-zinc-200">{invitation.inviterName}</strong> ({invitation.inviterEmail})
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workspace Details Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Workspace</span>
                  <div className="text-xs font-bold text-zinc-200 truncate flex items-center gap-1.5 mt-0.5">
                    <Building2 size={13} className="text-rose-400" />
                    <span>{invitation.workspaceName || 'CherryFlow'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Assigned Role</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase ${getRoleBadgeColor(invitation.role)}`}>
                    {invitation.role}
                  </span>
                </div>
              </div>

              {/* Read Only Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <User size={13} className="text-zinc-500" /> Full Name (Read Only)
                </label>
                <input
                  type="text"
                  readOnly
                  value={invitation.name || invitation.email.split('@')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs font-medium cursor-not-allowed"
                />
              </div>

              {/* Read Only Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <Mail size={13} className="text-zinc-500" /> Email Address (Read Only)
                </label>
                <input
                  type="email"
                  readOnly
                  value={invitation.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs font-medium cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <Lock size={13} className="text-rose-400" /> Create Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-rose-500 text-white text-xs outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-rose-400" /> Confirm Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-rose-500 text-white text-xs outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Joining Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Join Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Already have an account? Sign In instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
