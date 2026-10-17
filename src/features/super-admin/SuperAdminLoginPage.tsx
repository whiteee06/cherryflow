import React, { useState, useEffect } from 'react';
import { CherryFlowLogo } from '../../components/common/CherryFlowLogo';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SuperAdminService, SuperAdminAuthResult } from '../../services/superAdminService';

interface SuperAdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToUserLogin?: () => void;
}

export const SuperAdminLoginPage: React.FC<SuperAdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToUserLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [showForgotPasswordTooltip, setShowForgotPasswordTooltip] = useState(false);

  // Check account lockout status on mount
  useEffect(() => {
    async function checkStatus() {
      const status = await SuperAdminService.getStatus();
      if (status.isLocked) {
        setIsLocked(true);
        setLockoutRemaining(status.remainingLockoutSeconds || 900);
      }
    }
    checkStatus();
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutRemaining]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Super Admin username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result: SuperAdminAuthResult = await SuperAdminService.login(username.trim(), password, rememberMe);

    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      if (result.isLocked) {
        setIsLocked(true);
        setLockoutRemaining(result.remainingSeconds || 900);
        setErrorMsg('Account is locked due to 5 consecutive failed login attempts.');
      } else {
        setErrorMsg(result.error || 'Invalid super admin credentials.');
        if (typeof result.attemptsLeft === 'number') {
          setAttemptsLeft(result.attemptsLeft);
        }
      }
    }
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-rose-950/20 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <CherryFlowLogo size="xl" showSubtitle={true} animated={true} className="mb-4" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>Single Super Admin Gateway</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs">
            Restricted System Operating Portal. Authenticate with root credentials.
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>Account Locked (5 Failed Attempts)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Super Admin access is locked for security protection. Please wait before retrying.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-rose-300 font-bold">
              <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Time remaining: {formatLockoutTime(lockoutRemaining)}</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && !isLocked && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMsg}</p>
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <p className="text-[11px] text-rose-400/90 font-medium">
                  Notice: Account locks after {attemptsLeft} more failed attempt(s).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Super Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLocked || isLoading}
                placeholder="Username"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50 font-mono"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Super Admin Password
              </label>

              {/* Forgot Password Disabled Tooltip */}
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowForgotPasswordTooltip(true)}
                  onMouseLeave={() => setShowForgotPasswordTooltip(false)}
                  onClick={() => setShowForgotPasswordTooltip(!showForgotPasswordTooltip)}
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1 cursor-not-allowed"
                >
                  <KeyRound className="w-3 h-3 text-slate-500" />
                  <span className="line-through">Forgot Password</span>
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                </button>

                {showForgotPasswordTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 shadow-xl z-30 animate-in fade-in">
                    <p className="font-bold text-rose-400 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Security Policy
                    </p>
                    Forgot password self-service is strictly disabled for Super Admin. Contact system owner for database-level security reset.
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked || isLoading}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>Remember session securely</span>
            </label>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLocked || isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating Super Admin...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                Access Super Admin Console
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Links & System Badge */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3 text-center text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit TLS 1.3 & JWT Signed Authorization</span>
          </div>

          {onNavigateToUserLogin && (
            <button
              onClick={onNavigateToUserLogin}
              className="text-slate-400 hover:text-slate-200 transition-colors text-xs font-medium underline underline-offset-4"
            >
              &larr; Switch to Standard Workspace Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
