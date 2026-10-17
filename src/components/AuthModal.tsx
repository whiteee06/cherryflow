import React, { useState } from 'react';
import { CherryFlowLogo } from './common/CherryFlowLogo';
import { Flame, Lock, Mail, User, Building2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onAuthenticate: (user: UserProfile) => void;
  initialUser: UserProfile;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onAuthenticate,
  initialUser,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('sarah.lin@cherryflow.io');
  const [password, setPassword] = useState('••••••••••••');
  const [businessName, setBusinessName] = useState('Vanguard Digital Agency');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'forgot') {
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setResetSent(true);
      return;
    }

    if (mode === 'signup') {
      if (!name || !email || !businessName) {
        setError('Please fill in all required fields.');
        return;
      }
      const newUser: UserProfile = {
        ...initialUser,
        id: `usr_${Date.now()}`,
        name,
        email,
        businessName,
      };
      onAuthenticate(newUser);
      return;
    }

    // Sign in mode
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    const authenticatedUser: UserProfile = {
      ...initialUser,
      email: email || initialUser.email,
      name: name || initialUser.name,
      businessName: businessName || initialUser.businessName,
    };

    onAuthenticate(authenticatedUser);
  };

  const handleDemoSignIn = () => {
    onAuthenticate(initialUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-zinc-100 relative">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <CherryFlowLogo size="xl" showSubtitle={true} className="mb-2" />
          <p className="text-xs text-zinc-400 mt-2">
            {mode === 'signin' && 'Sign in to access your AI business operating system'}
            {mode === 'signup' && 'Create your CherryFlow business account'}
            {mode === 'forgot' && 'Reset your password to regain access'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        {mode === 'forgot' && resetSent ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-center space-y-3">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-200">Reset Email Sent</h3>
            <p className="text-xs text-zinc-400">
              We have sent password recovery instructions to <span className="text-white font-mono">{email}</span>.
            </p>
            <button
              onClick={() => {
                setMode('signin');
                setResetSent(false);
              }}
              className="mt-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-xl text-zinc-200 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Lin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Business Name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. Vanguard Digital"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-400">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>
                {mode === 'signin' && 'Sign In to Dashboard'}
                {mode === 'signup' && 'Create Account & Launch'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* Demo Quick Login */}
        <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500 mb-2">Testing CherryFlow OS as a founder?</p>
          <button
            onClick={handleDemoSignIn}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Flame size={14} className="text-rose-500" />
            <span>1-Click Demo Founder Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
