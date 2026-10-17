import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from './schemas';
import { useAuth } from '../../context/AuthContext';
import {
  Cherry,
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const { register: registerAuth, setScreen, error, isSupabaseConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      role: 'owner',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  const pwdVal = watch('password') || '';

  // Password requirements calculation
  const pwdReqs = [
    { label: 'At least 8 characters', pass: pwdVal.length >= 8 },
    { label: 'One uppercase letter (A-Z)', pass: /[A-Z]/.test(pwdVal) },
    { label: 'One lowercase letter (a-z)', pass: /[a-z]/.test(pwdVal) },
    { label: 'One number (0-9)', pass: /[0-9]/.test(pwdVal) },
    { label: 'One special character (!@#$%)', pass: /[^A-Za-z0-9]/.test(pwdVal) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerAuth(data);
    } catch {
      // Error is set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

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

        <h2 className="text-3xl font-extrabold tracking-tight text-white">Create your CherryFlow Account</h2>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          Start your business journey today.
        </p>

        {/* Supabase Status Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
          <ShieldCheck className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span>{isSupabaseConfigured ? 'Supabase Auth Ready' : 'Preview Sandbox Mode'}</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800/80">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-200">Registration Issue</p>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  {error.includes('Failed to fetch') || error.includes('NetworkError')
                    ? 'Unable to connect to the registration service. Please verify your connection or try again.'
                    : error}
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Name & Business Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Alex Rivera"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                      errors.name ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                    } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    {...register('businessName')}
                    type="text"
                    placeholder="Apex Growth Agency"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                      errors.businessName ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                    } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-xs text-rose-400">{errors.businessName.message}</p>
                )}
              </div>
            </div>

            {/* Email & Role Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
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
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                      errors.email ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                    } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Account Role
                </label>
                <select
                  {...register('role')}
                  className="w-full py-2.5 px-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus:border-rose-500 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer"
                >
                  <option value="owner">Owner (Full)</option>
                  <option value="admin">Admin Manager</option>
                  <option value="member">Team Member</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border ${
                      errors.password ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                    } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                      errors.confirmPassword ? 'border-rose-500/80' : 'border-slate-800 hover:border-slate-700 focus:border-rose-500'
                    } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Requirement Checks */}
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <span className="font-medium text-slate-400 block mb-1">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {pwdReqs.map((req, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {req.pass ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className={req.pass ? 'text-emerald-300' : 'text-slate-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-rose-500 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400 leading-normal">
                  I agree to CherryFlow's{' '}
                  <span className="text-slate-300 font-medium hover:underline">Terms of Service</span> and{' '}
                  <span className="text-slate-300 font-medium hover:underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-rose-400">{errors.acceptTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-medium text-sm hover:from-rose-500 hover:to-rose-400 active:scale-[0.99] transition-all duration-150 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Operating</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <button
              onClick={() => setScreen('login')}
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
            >
              Sign in to your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
