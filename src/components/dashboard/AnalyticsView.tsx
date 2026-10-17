import React, { useState } from 'react';
import { BusinessOverview, Customer, Task, Note, TimeframePeriod } from '../../types';
import { AnalyticsKpiCards } from '../analytics/AnalyticsKpiCards';
import { RevenueAnalyticsTab } from '../analytics/RevenueAnalyticsTab';
import { CustomerAnalyticsTab } from '../analytics/CustomerAnalyticsTab';
import { ProductivityAnalyticsTab } from '../analytics/ProductivityAnalyticsTab';
import { AIUsageAnalyticsTab } from '../analytics/AIUsageAnalyticsTab';
import { ReportsAndExportTab } from '../analytics/ReportsAndExportTab';
import {
  BarChart3,
  DollarSign,
  Users,
  CheckSquare,
  Sparkles,
  FileText,
  Zap,
  Filter,
  Calendar,
} from 'lucide-react';

interface AnalyticsViewProps {
  overview: BusinessOverview;
  customers: Customer[];
  tasks: Task[];
  notes?: Note[];
  currencySymbol?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  overview,
  customers,
  tasks,
  notes = [],
  currencySymbol = '$',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'revenue' | 'customers' | 'productivity' | 'ai' | 'reports'
  >('overview');

  const [timeframe, setTimeframe] = useState<TimeframePeriod>('all');

  // Compute total pipeline value
  const pipelineValue = customers.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  // Filter tasks & customers by timeframe if needed
  const nowIso = new Date().toISOString().split('T')[0];
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived').length;
  const overdueTasksCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'archived' && t.dueDate && t.dueDate < nowIso
  ).length;

  const activeCustomersCount = customers.filter(
    (c) => c.status === 'active' || c.status === 'won' || c.status === 'proposal'
  ).length;

  // New customers in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const newCustomersCount = customers.filter((c) => c.createdAt && c.createdAt >= thirtyDaysAgo).length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-rose-500" size={22} />
            <h2 className="text-2xl font-black tracking-tight">Business Analytics & Executive Reporting</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time telemetry on revenue streams, customer growth rates, operational efficiency, and AI usage logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-xs font-semibold text-rose-400 flex items-center gap-1.5">
            <Zap size={14} className="animate-pulse" />
            <span>Supabase Sync Active</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <BarChart3 size={15} />
            Business Overview
          </button>

          <button
            onClick={() => setActiveSubTab('revenue')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'revenue'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <DollarSign size={15} />
            Revenue Analytics
          </button>

          <button
            onClick={() => setActiveSubTab('customers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'customers'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Users size={15} />
            Customer Growth
          </button>

          <button
            onClick={() => setActiveSubTab('productivity')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'productivity'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <CheckSquare size={15} />
            Task Productivity
          </button>

          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ai'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <Sparkles size={15} />
            AI Usage Logs
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'reports'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <FileText size={15} />
            Reports & Export
          </button>
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <AnalyticsKpiCards
            totalCustomers={customers.length}
            newCustomers={newCustomersCount}
            activeCustomers={activeCustomersCount}
            completedTasks={completedTasksCount}
            pendingTasks={pendingTasksCount}
            overdueTasks={overdueTasksCount}
            notesCreated={notes.length}
            pipelineValue={pipelineValue}
            currencySymbol={currencySymbol}
          />
          <RevenueAnalyticsTab customers={customers} currencySymbol={currencySymbol} />
        </div>
      )}

      {activeSubTab === 'revenue' && (
        <RevenueAnalyticsTab customers={customers} currencySymbol={currencySymbol} />
      )}

      {activeSubTab === 'customers' && (
        <CustomerAnalyticsTab customers={customers} currencySymbol={currencySymbol} />
      )}

      {activeSubTab === 'productivity' && (
        <ProductivityAnalyticsTab tasks={tasks} />
      )}

      {activeSubTab === 'ai' && <AIUsageAnalyticsTab />}

      {activeSubTab === 'reports' && (
        <ReportsAndExportTab customers={customers} tasks={tasks} notes={notes} currencySymbol={currencySymbol} />
      )}
    </div>
  );
};
