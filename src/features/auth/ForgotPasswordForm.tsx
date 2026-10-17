import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from './schemas';
import { useAuth } from '../../context/AuthContext';
import { Cherry, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, setScreen, error, setError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const msg = await forgotPassword(data.email);
      setSuccessMsg(msg);
    } catch {
      // Error in context
    } finally {
      setIsSubmitting(false);
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

        <h2 className="text-2xl font-extrabold tracking-tight text-white">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your registered email address and we'll send reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800/80">
          {successMsg ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {successMsg}
              </p>
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setScreen('reset_password')}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all cursor-pointer"
                >
                  Proceed to Reset Password Page
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-rose-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-medium text-sm hover:from-rose-500 hover:to-rose-400 active:scale-[0.99] transition-all duration-150 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
