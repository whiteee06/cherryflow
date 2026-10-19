import React from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react';

interface BillingDashboardViewProps {
  currentUser: { id: string; name: string; email: string; role?: string };
  workspaceId?: string;
}

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = () => {

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="text-emerald-400" size={22} />
            <h2 className="text-2xl font-black tracking-tight">Workspace Plan & Open Access</h2>
          </div>
          <p className="text-xs text-zinc-400">
            CherryFlow OS follows a strictly 100% free product model with zero payment requirements or hidden charges.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Active Free License</span>
        </div>
      </div>

      {/* CURRENT SUBSCRIPTION BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-xl shadow-md">
            F
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                Free Unlimited Workspace Plan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/20 uppercase">
                Active & Unconstrained
              </span>
            </div>

            <p className="text-xs text-zinc-500 mt-1">
              Subscription Cost: <span className="font-bold text-emerald-500">$0.00 / month</span> (100% Free Forever)
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Includes full access to CRM management, team collaboration, task tracking, notes, and workflow automations.
            </p>
          </div>
        </div>
      </div>

      {/* WORKSPACE USAGE & UNLIMITED RESOURCE METRICS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Zap size={18} className="text-rose-500" />
            Workspace Capacity & Features
          </h3>
          <span className="text-xs font-semibold text-emerald-500">
            Unlimited Capacity Included
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-purple-500" />
                Team Seats
              </span>
              <span className="text-emerald-500">Unlimited Seats</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Invite unlimited team members with full role-based access control.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-500" />
                CRM Customers & Deals
              </span>
              <span className="text-emerald-500">Unlimited Records</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Store customer profiles, deal pipelines, and timeline notes without quota limits.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-rose-500" />
                Tasks & Automations
              </span>
              <span className="text-emerald-500">Unlimited Workflows</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Create task lists, assign priorities, and configure trigger-action rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
