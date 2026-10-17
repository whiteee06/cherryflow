import React, { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../../types';
import { BillingService } from '../../services/BillingService';
import {
  X,
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Plus,
  Save,
  Shield,
  Edit2,
  CheckCircle2,
  AlertCircle,
  BarChart2,
} from 'lucide-react';

interface AdminPlanManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlansUpdated: () => void;
}

export const AdminPlanManagerModal: React.FC<AdminPlanManagerModalProps> = ({
  isOpen,
  onClose,
  onPlansUpdated,
}) => {
  if (!isOpen) return null;

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [revenueData, setRevenueData] = useState<{
    mrr: number;
    arr: number;
    activeSubscribers: number;
    churnRatePct: number;
    planBreakdown: { planName: string; count: number; revenue: number }[];
  } | null>(null);

  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const pList = await BillingService.getPlans();
    setPlans(pList);

    const rev = await BillingService.getAdminRevenueAnalytics();
    setRevenueData(rev);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setIsSaving(true);
    try {
      await BillingService.saveCustomPlan(editingPlan);
      setEditingPlan(null);
      await loadData();
      onPlansUpdated();
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `custom_${Date.now()}`,
      name: 'Custom Team Plan',
      description: 'Specialized enterprise features and custom quota allocation.',
      priceMonthly: 99,
      priceYearly: 950,
      currency: '$',
      features: ['Custom Seats', 'Expanded Storage', 'Dedicated AI Model'],
      limits: {
        users: 50,
        storageGb: 100,
        aiCredits: 10000,
        projects: 200,
        customers: 2000,
        tasks: 10000,
      },
      isActive: true,
    };
    setEditingPlan(newPlan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
            <BarChart2 size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              SaaS Admin & Subscription Revenue Analytics
            </h3>
            <p className="text-xs text-zinc-500">
              Configure subscription tiers, monitor MRR growth, and adjust customer quota allocations.
            </p>
          </div>
        </div>

        {/* REVENUE METRICS CARDS */}
        {revenueData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Recurring (MRR)</p>
              <p className="text-2xl font-black text-rose-500 mt-1">${revenueData.mrr.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Annual Recurring (ARR)</p>
              <p className="text-2xl font-black text-emerald-500 mt-1">${revenueData.arr.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Active Subscribers</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {revenueData.activeSubscribers}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Churn Rate</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{revenueData.churnRatePct}%</p>
            </div>
          </div>
        )}

        {/* PLAN EDITOR OR PLAN LIST */}
        {editingPlan ? (
          <form onSubmit={handleSavePlan} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Edit Plan: {editingPlan.name}
              </h4>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
              >
                Cancel Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Price Monthly ($)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.priceMonthly}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Price Yearly ($)</label>
                <input
                  type="number"
                  required
                  value={editingPlan.priceYearly}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Quotas */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500">Seats Limit</label>
                <input
                  type="number"
                  value={editingPlan.limits.users}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, users: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500">Storage Limit (GB)</label>
                <input
                  type="number"
                  value={editingPlan.limits.storageGb}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, storageGb: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500">AI Monthly Credits</label>
                <input
                  type="number"
                  value={editingPlan.limits.aiCredits}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, aiCredits: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Save size={14} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Active Subscription Plans</h4>
              <button
                onClick={handleCreateNewPlan}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                Create Custom Plan
              </button>
            </div>

            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{p.name}</h5>
                      {p.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                          Popular
                        </span>
                      )}
                      {p.isEnterprise && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold">
                          Enterprise
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.description}</p>
                    <p className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 mt-2">
                      ${p.priceMonthly}/mo · ${p.priceYearly}/yr · {p.limits.users} seats · {p.limits.aiCredits.toLocaleString()} AI credits
                    </p>
                  </div>

                  <button
                    onClick={() => setEditingPlan(p)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Edit2 size={13} />
                    Edit Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
