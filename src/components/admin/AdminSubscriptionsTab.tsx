import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AdminSubscriptionsTabProps {
  onUpgradeWorkspace: (workspaceId: string, newPlanTier: string) => void;
  onRefundTransaction: (txnId: string) => void;
}

export const AdminSubscriptionsTab: React.FC<AdminSubscriptionsTabProps> = ({
  onUpgradeWorkspace,
  onRefundTransaction,
}) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('ws_acme_1');
  const [selectedTier, setSelectedTier] = useState('business');
  const [notice, setNotice] = useState<string | null>(null);

  const transactions = [
    {
      id: 'txn_901',
      workspaceName: 'Acme Corp Workspace',
      customer: 'Sarah Chen (sarah.chen@acmecorp.com)',
      plan: 'Professional Tier',
      amount: 149.0,
      status: 'paid',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'txn_902',
      workspaceName: 'Nexus Main Hub',
      customer: 'Marcus Vance (marcus@nexustech.io)',
      plan: 'Business Tier',
      amount: 499.0,
      status: 'paid',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: 'txn_903',
      workspaceName: 'Global Fintech HQ',
      customer: 'Liam O\'Connor (liam@globalfintech.org)',
      plan: 'Enterprise Tier',
      amount: 2400.0,
      status: 'paid',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    },
    {
      id: 'txn_904',
      workspaceName: 'Starlight Team Studio',
      customer: 'Jessica Taylor (jessica@starlightagency.com)',
      plan: 'Starter Tier',
      amount: 49.0,
      status: 'refunded',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    },
  ];

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Monthly Recurring Revenue</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">$48,900.00</div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% MoM Expansion
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Active Subscriptions</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">285 Workspaces</div>
          <span className="text-xs text-zinc-400">92% Annual Contracts</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Average Revenue Per User (ARPU)</span>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">$171.50</div>
          <span className="text-xs text-rose-500 font-bold">Stripe Automatic Invoicing</span>
        </div>
      </div>

      {/* Manual Plan Tier Override Tool */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Super Admin Plan Tier Override &amp; Trial Extension
          </h3>
        </div>
        <p className="text-xs text-zinc-500">
          Super admins can directly upgrade, downgrade, or issue custom enterprise trial overrides to any customer workspace without requiring a card transaction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Workspace *
            </label>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="ws_acme_1">Acme Corp Workspace (Professional)</option>
              <option value="ws_nexus_2">Nexus Main Hub (Business)</option>
              <option value="ws_starlight_3">Starlight Team Studio (Starter)</option>
              <option value="ws_fintech_4">Global Fintech HQ (Enterprise)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Target Tier Override *
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="free">Free Starter Tier ($0/mo)</option>
              <option value="starter">Starter Plan ($49/mo)</option>
              <option value="professional">Professional Plan ($149/mo)</option>
              <option value="business">Business Suite ($499/mo)</option>
              <option value="enterprise">Enterprise Custom ($2,400/mo)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                onUpgradeWorkspace(selectedWorkspaceId, selectedTier);
                triggerNotice(`Successfully updated workspace tier to ${selectedTier.toUpperCase()}`);
              }}
              className="w-full p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Apply Admin Override
            </button>
          </div>
        </div>
      </div>

      {/* Transaction & Billing History Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm space-y-0">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
            Recent Subscription Transactions &amp; Refund Logs
          </h3>
          <span className="text-xs text-zinc-400">Stripe Integration Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Txn Reference</th>
                <th className="py-3 px-4">Workspace &amp; Customer</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Refund Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">{t.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold block">{t.workspaceName}</span>
                    <span className="text-zinc-400 text-[11px]">{t.customer}</span>
                  </td>
                  <td className="py-3.5 px-4">{t.plan}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                    ${t.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        t.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {t.status === 'paid' ? (
                      <button
                        onClick={() => {
                          if (confirm(`Refund transaction ${t.id} ($${t.amount}) back to customer?`)) {
                            onRefundTransaction(t.id);
                            triggerNotice(`Triggered full refund for transaction ${t.id}`);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Refund Payment
                      </button>
                    ) : (
                      <span className="text-zinc-400 text-[11px] italic">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
