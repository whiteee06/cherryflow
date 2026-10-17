import React from 'react';
import { DollarSign, Users, CheckSquare, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { BusinessOverview } from '../../types';

interface OverviewCardsProps {
  overview: BusinessOverview;
  currencySymbol?: string;
  onNavigateTab: (tab: any) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  overview,
  currencySymbol = '$',
  onNavigateTab,
}) => {
  const cards = [
    {
      title: 'Monthly Revenue',
      value: `${currencySymbol}${overview.monthlyRevenue.toLocaleString()}`,
      change: `+${overview.revenueGrowthPct}% vs last month`,
      isPositive: true,
      icon: DollarSign,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      actionTab: 'dashboard',
    },
    {
      title: 'Active Customers',
      value: overview.activeCustomers.toString(),
      change: `+${overview.customerGrowthPct}% pipeline growth`,
      isPositive: true,
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      actionTab: 'customers',
    },
    {
      title: 'Task Completion Rate',
      value: `${overview.taskCompletionRate}%`,
      change: `${overview.pendingTasks} tasks remaining`,
      isPositive: overview.pendingTasks < 10,
      icon: CheckSquare,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      actionTab: 'tasks',
    },
    {
      title: 'Strategy & Knowledge Notes',
      value: overview.totalNotes.toString(),
      change: 'Active knowledge base',
      isPositive: true,
      icon: FileText,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      actionTab: 'notes',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab(card.actionTab)}
            className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Top Row: Icon & Action arrow */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon size={20} />
              </div>
              <span className="text-zinc-400 group-hover:text-rose-500 transition-colors">
                <ArrowUpRight size={18} />
              </span>
            </div>

            {/* Value & Title */}
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.title}</p>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
                {card.value}
              </h3>
            </div>

            {/* Bottom Change Badge */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1.5 text-xs font-medium">
              {card.isPositive ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <Clock size={14} className="text-amber-500" />
              )}
              <span className={card.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}>
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
