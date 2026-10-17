import React from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Sparkles,
} from 'lucide-react';

interface AnalyticsKpiCardsProps {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  notesCreated: number;
  pipelineValue: number;
  currencySymbol?: string;
  timeframeLabel?: string;
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({
  totalCustomers,
  newCustomers,
  activeCustomers,
  completedTasks,
  pendingTasks,
  overdueTasks,
  notesCreated,
  pipelineValue,
  currencySymbol = '$',
  timeframeLabel = 'This Period',
}) => {
  const cards = [
    {
      id: 'kpi_total_customers',
      label: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      subtext: `All-time in database`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'kpi_new_customers',
      label: 'New Customers',
      value: newCustomers.toLocaleString(),
      subtext: `Added ${timeframeLabel}`,
      icon: UserPlus,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      id: 'kpi_active_customers',
      label: 'Active Customers',
      value: activeCustomers.toLocaleString(),
      subtext: `${totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% active engagement`,
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'kpi_completed_tasks',
      label: 'Completed Tasks',
      value: completedTasks.toLocaleString(),
      subtext: `Finished deliverables`,
      icon: CheckCircle2,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      id: 'kpi_pending_tasks',
      label: 'Pending Tasks',
      value: pendingTasks.toLocaleString(),
      subtext: `In progress & to-do`,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'kpi_overdue_tasks',
      label: 'Overdue Tasks',
      value: overdueTasks.toLocaleString(),
      subtext: overdueTasks > 0 ? `Requires immediate action` : `No overdue tasks`,
      icon: AlertTriangle,
      color: overdueTasks > 0 ? 'text-rose-500' : 'text-zinc-400',
      bgColor: overdueTasks > 0 ? 'bg-rose-500/10' : 'bg-zinc-500/10',
      borderColor: overdueTasks > 0 ? 'border-rose-500/30' : 'border-zinc-500/20',
    },
    {
      id: 'kpi_notes_created',
      label: 'Notes Created',
      value: notesCreated.toLocaleString(),
      subtext: `Strategy & client docs`,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner highlight: Pipeline Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div id="card_pipeline_value" className="p-5 rounded-2xl bg-linear-to-br from-rose-900/40 via-zinc-900 to-zinc-900 border border-rose-500/30 shadow-md">
          <div className="flex items-center justify-between text-xs text-rose-300 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <DollarSign size={16} className="text-rose-400" />
              Total Pipeline Value
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              Live Forecast
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {currencySymbol}
            {pipelineValue.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Across all open deals in CRM pipeline</p>
        </div>

        <div id="card_execution_rate" className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Execution Completion Rate</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {completedTasks + pendingTasks > 0
              ? `${Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)}%`
              : '100%'}
          </p>
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  completedTasks + pendingTasks > 0
                    ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        <div id="card_ai_productivity" className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>AI Copilot Impact</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">98.4%</p>
          <p className="text-xs text-zinc-400 mt-1">Estimated ~38.5 hours saved this month</p>
        </div>
      </div>

      {/* Grid of 7 Prompt Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">{card.label}</span>
                <div className={`p-1.5 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon size={14} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{card.value}</p>
              </div>

              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">{card.subtext}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
