import React, { useState } from 'react';
import { SubscriptionPlan, BillingCycle, PaymentProviderType } from '../../types';
import { BillingService } from '../../services/BillingService';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Tag,
  Lock,
  Sparkles,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: SubscriptionPlan;
  currentPlanId: string;
  workspaceId: string;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  targetPlan,
  currentPlanId,
  workspaceId,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [provider, setProvider] = useState<PaymentProviderType>('stripe');
  const [promoCode, setPromoCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const rawPrice =
    billingCycle === 'yearly' ? targetPlan.priceYearly : targetPlan.priceMonthly;
  const finalPrice =
    discountPct > 0 ? Math.round(rawPrice * (1 - discountPct / 100)) : rawPrice;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'CHERRY20') {
      setDiscountPct(20);
      setPromoSuccess('20% promo discount applied!');
    } else if (promoCode.trim().toUpperCase() === 'LAUNCH50') {
      setDiscountPct(50);
      setPromoSuccess('50% launch special discount applied!');
    } else {
      setPromoError('Invalid promo code. Try "CHERRY20" or "LAUNCH50"');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await BillingService.processSubscriptionChange({
        workspaceId,
        targetPlanId: targetPlan.id,
        billingCycle,
        provider,
        simulateFailure,
        promoCode,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'Payment failed to process.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Upgrade to {targetPlan.name} Plan
            </h3>
            <p className="text-xs text-zinc-500">
              Unlock higher limits, advanced AI features, and dedicated team quotas.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Billing Cycle Switcher */}
          <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>

          {/* Price & Summary Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  {targetPlan.currency}
                  {finalPrice}
                </span>
                <span className="text-xs text-zinc-500 font-semibold ml-1">
                  / {billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>

              {discountPct > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {discountPct}% Discount Applied
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-700/80 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <div>• {targetPlan.limits.users} Team Seats</div>
              <div>• {targetPlan.limits.storageGb} GB Storage</div>
              <div>• {targetPlan.limits.aiCredits.toLocaleString()} AI Credits</div>
              <div>• {targetPlan.limits.projects} Active Projects</div>
            </div>
          </div>

          {/* Payment Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Payment Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'stripe' as PaymentProviderType, label: 'Stripe Credit Card', badge: 'Popular' },
                { id: 'razorpay' as PaymentProviderType, label: 'Razorpay / UPI', badge: 'India' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    provider === p.id
                      ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Promo Code Input */}
          <div>
            <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (e.g. CHERRY20)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition-all"
              >
                Apply
              </button>
            </form>
            {promoSuccess && <p className="text-[11px] font-bold text-emerald-500 mt-1">{promoSuccess}</p>}
            {promoError && <p className="text-[11px] font-bold text-rose-500 mt-1">{promoError}</p>}
          </div>

          {/* Testing Failure Simulator Switch */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <div>
                <p className="font-bold">Simulate Payment Failure</p>
                <p className="text-[10px] opacity-90">Useful for testing subscription decline error handling</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="w-4 h-4 accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security note & Checkout button */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <Lock size={12} />
              <span>256-bit encrypted checkout powered by {provider.toUpperCase()}</span>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard size={16} />
              {isProcessing
                ? 'Processing Authorization...'
                : `Confirm & Pay ${targetPlan.currency}${finalPrice}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
