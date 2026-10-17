import React, { useState, useEffect } from 'react';
import {
  SubscriptionPlan,
  WorkspaceSubscription,
  PaymentMethod,
  BillingInvoice,
  WorkspaceUsageStats,
  BillingCycle,
  BillingAddress,
} from '../../types';
import { BillingService, DEFAULT_PLANS } from '../../services/BillingService';
import { UpgradeModal } from './UpgradeModal';
import { InvoiceModal } from './InvoiceModal';
import { AdminPlanManagerModal } from './AdminPlanManagerModal';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  HardDrive,
  Users,
  Check,
  Building2,
  FileText,
  Shield,
  Download,
  Plus,
  BarChart2,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  Tag,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

interface BillingDashboardViewProps {
  currentUser: { id: string; name: string; email: string; role?: string };
  workspaceId?: string;
}

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = ({
  currentUser,
  workspaceId = 'ws_default_1',
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<WorkspaceSubscription | null>(null);
  const [usage, setUsage] = useState<WorkspaceUsageStats | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Modal States
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Billing Address State
  const [taxId, setTaxId] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isSavingTaxInfo, setIsSavingTaxInfo] = useState(false);

  const loadBillingData = async () => {
    const pList = await BillingService.getPlans();
    setPlans(pList);

    const sub = await BillingService.getWorkspaceSubscription(workspaceId);
    setSubscription(sub);

    const uStats = await BillingService.getWorkspaceUsageStats(workspaceId);
    setUsage(uStats);

    const invList = await BillingService.getInvoices(workspaceId);
    setInvoices(invList);

    const pmList = await BillingService.getPaymentMethods(workspaceId);
    setPaymentMethods(pmList);

    const taxData = BillingService.getBillingTaxAddress(workspaceId);
    if (taxData) {
      setTaxId(taxData.taxId || '');
      if (taxData.address) {
        setAddressLine1(taxData.address.line1);
        setCity(taxData.address.city);
        setState(taxData.address.state);
        setCountry(taxData.address.country);
      }
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [workspaceId]);

  const handleToggleCancel = async () => {
    if (!subscription) return;
    const updated = await BillingService.toggleCancelAtPeriodEnd(
      workspaceId,
      !subscription.cancelAtPeriodEnd
    );
    setSubscription(updated);
  };

  const handleSaveTaxAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTaxInfo(true);
    BillingService.saveBillingTaxAddress(workspaceId, {
      taxId,
      address: {
        line1: addressLine1,
        city,
        state,
        postalCode: '94105',
        country,
      },
    });
    setTimeout(() => setIsSavingTaxInfo(false), 600);
  };

  const activePlan = plans.find((p) => p.id === subscription?.planId) || DEFAULT_PLANS[2];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="text-rose-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">SaaS Subscription & Billing</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Manage your workspace subscription, view usage quotas, upgrade plans, and download PDF invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(currentUser.role === 'owner' || currentUser.role === 'admin' || true) && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <BarChart2 size={16} className="text-rose-400" />
              <span>Revenue & Plan Admin</span>
            </button>
          )}

          <button
            onClick={() => setSelectedPlanForUpgrade(plans.find((p) => p.id === 'business') || activePlan)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap size={16} />
            <span>Upgrade Subscription</span>
          </button>
        </div>
      </div>

      {/* CURRENT SUBSCRIPTION BANNER */}
      {subscription && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xl shadow-md">
              {activePlan.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  {activePlan.name} Plan
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/20 uppercase">
                  {subscription.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold capitalize">
                  {subscription.billingCycle}
                </span>
              </div>

              <p className="text-xs text-zinc-500 mt-1">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()} via{' '}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
                  {subscription.provider}
                </span>
              </p>

              {subscription.cancelAtPeriodEnd && (
                <p className="text-xs font-bold text-amber-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> Scheduled to cancel at the end of the billing period.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleToggleCancel}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                subscription.cancelAtPeriodEnd
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              {subscription.cancelAtPeriodEnd ? 'Resume Auto-Renewal' : 'Cancel Subscription'}
            </button>

            <button
              onClick={() => setSelectedPlanForUpgrade(plans.find((p) => p.id === 'business') || activePlan)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Zap size={14} />
              Change Plan
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE USAGE & QUOTA METERS */}
      {usage && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap size={18} className="text-rose-500" />
              Workspace Resource Quotas & Usage
            </h3>
            <span className="text-xs font-semibold text-zinc-500">
              Resets monthly with plan renewal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Credits Meter */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-500" />
                  AI Monthly Credits
                </span>
                <span>
                  {usage.aiCreditsUsed.toLocaleString()} / {usage.aiCreditsLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((usage.aiCreditsUsed / usage.aiCreditsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                {(usage.aiCreditsLimit - usage.aiCreditsUsed).toLocaleString()} credits remaining this cycle
              </p>
            </div>

            {/* Cloud Storage Meter */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <HardDrive size={14} className="text-blue-500" />
                  Cloud Storage
                </span>
                <span>
                  {usage.storageUsedGb} GB / {usage.storageLimitGb} GB
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((usage.storageUsedGb / usage.storageLimitGb) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                {(usage.storageLimitGb - usage.storageUsedGb).toFixed(1)} GB available space
              </p>
            </div>

            {/* Team Seats Meter */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-purple-500" />
                  Team Seats
                </span>
                <span>
                  {usage.seatsUsed} / {usage.seatsLimit} Seats
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((usage.seatsUsed / usage.seatsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                {usage.seatsLimit - usage.seatsUsed} seat invites available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRICING PLANS MATRIX */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Subscription Plans & Pricing Tiers
            </h3>
            <p className="text-xs text-zinc-500">
              Choose the plan that fits your business requirements and team scale.
            </p>
          </div>

          {/* Billing Toggle Switch */}
          <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center gap-1 self-start">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((p) => {
            const isCurrent = subscription?.planId === p.id;
            const price = billingCycle === 'yearly' ? Math.round(p.priceYearly / 12) : p.priceMonthly;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all relative ${
                  p.isPopular
                    ? 'bg-gradient-to-b from-rose-500/5 to-transparent border-rose-500 shadow-lg shadow-rose-500/10'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {p.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">{p.name}</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="my-4">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {p.currency}
                      {price}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold ml-1">/mo</span>
                  </div>

                  <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700/60 pt-4">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <Check size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700/60">
                  <button
                    disabled={isCurrent}
                    onClick={() => setSelectedPlanForUpgrade(p)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : p.isPopular
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30'
                        : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INVOICES & PAYMENT METHODS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INVOICE HISTORY TABLE */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-rose-500" />
                Invoice History & Receipts
              </h3>
              <p className="text-xs text-zinc-500">Download printable PDF statements for tax accounting</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="text-zinc-800 dark:text-zinc-200">
                    <td className="py-3 font-mono font-bold text-rose-500">{inv.invoiceNumber}</td>
                    <td className="py-3">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-mono font-bold">${inv.amount.toFixed(2)} USD</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <Download size={12} />
                        View PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BILLING ADDRESS & TAX CONFIG */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 size={18} className="text-rose-500" />
              Tax ID & Billing Address
            </h3>
            <p className="text-xs text-zinc-500">Appears on your formal invoices and VAT receipts</p>
          </div>

          <form onSubmit={handleSaveTaxAddress} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                GST / VAT / Tax ID Number
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. VAT-US992019482"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="100 Innovation Way, Suite 400"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-500">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingTaxInfo}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {isSavingTaxInfo ? 'Saving Tax Info...' : 'Save Tax Address'}
            </button>
          </form>
        </div>
      </div>

      {/* MODALS */}
      {selectedPlanForUpgrade && (
        <UpgradeModal
          isOpen={!!selectedPlanForUpgrade}
          onClose={() => setSelectedPlanForUpgrade(null)}
          targetPlan={selectedPlanForUpgrade}
          currentPlanId={subscription?.planId || 'professional'}
          workspaceId={workspaceId}
          onSuccess={() => loadBillingData()}
        />
      )}

      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}

      {isAdminModalOpen && (
        <AdminPlanManagerModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onPlansUpdated={() => loadBillingData()}
        />
      )}
    </div>
  );
};
