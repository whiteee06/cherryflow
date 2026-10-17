import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from './schemas';
import { useAuth } from '../../context/AuthContext';
import { Cherry, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, setScreen, error, setError, isSupabaseConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data);
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-900/10 rounded-full blur-2xl pointer-events-none" />

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

        <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          Sign in to CherryFlow
        </p>
        <p className="text-xs text-rose-400 font-semibold mt-1 uppercase tracking-wider">
          AI-Powered Business Operating System
        </p>

        {/* Supabase Status Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
          <ShieldCheck className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span>{isSupabaseConfigured ? 'Connected to Supabase Cloud' : 'Preview Sandbox Mode'}</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800/80">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-200">Authentication Error</p>
                <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="alex@cherryflow.io"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    errors.email ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                  } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setScreen('forgot_password')}
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    errors.password ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                  } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-rose-500 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400">Remember session for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-medium text-sm hover:from-rose-500 hover:to-rose-400 active:scale-[0.99] transition-all duration-150 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              onClick={() => setScreen('register')}
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
            >
              Create free account
            </button>
          </div>

          {/* Dedicated Developer / Super Admin Entrance */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setScreen('super_admin_login')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <ShieldCheck className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Developer & Super Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-500">
          <div className="flex justify-center gap-4">
            <button onClick={() => setScreen('landing')} className="hover:text-slate-300 cursor-pointer">
              Home Landing
            </button>
            <span>•</span>
            <button onClick={() => setScreen('setup_guide')} className="hover:text-slate-300 cursor-pointer">
              Supabase Setup Guide
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">© 2026 CherryFlow Technologies</p>
        </div>
      </div>
    </div>
  );
};
