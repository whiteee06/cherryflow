import React, { useState, useEffect, useMemo } from 'react';
import { Customer } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CustomerLTVConfig {
  upfrontValue: number;
  monthlyRetainer: number;
  expectedLifespanMonths: number;
  billingFrequency: 'monthly' | 'quarterly' | 'annual';
  marginPct: number;
}

interface CustomerLTVCalculatorProps {
  customer: Customer;
  currencySymbol?: string;
  onUpdateCustomerDealValue?: (newDealValue: number) => void;
}

export const CustomerLTVCalculator: React.FC<CustomerLTVCalculatorProps> = ({
  customer,
  currencySymbol = '$',
}) => {
  const [showAdjustControls, setShowAdjustControls] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Initialize config based on customer data or localStorage
  const storageKey = `cherryflow_ltv_config_${customer.id}`;

  const defaultConfig: CustomerLTVConfig = useMemo(() => {
    const baseValue = customer.dealValue || 5000;
    // Estimate upfront fee as ~30% of deal value or min 1000
    const initialUpfront = Math.round(baseValue * 0.3);
    // Estimate monthly retainer
    const initialRetainer = Math.max(200, Math.round((baseValue - initialUpfront) / 6 || baseValue / 12 || 500));

    return {
      upfrontValue: initialUpfront,
      monthlyRetainer: initialRetainer,
      expectedLifespanMonths: 18,
      billingFrequency: 'monthly',
      marginPct: 85,
    };
  }, [customer.dealValue]);

  const [config, setConfig] = useState<CustomerLTVConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return defaultConfig;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config, storageKey]);

  // Reset to default
  const handleReset = () => {
    setConfig(defaultConfig);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Calculate elapsed months since customer was created
  const monthsElapsed = useMemo(() => {
    const createdDate = customer.createdAt ? new Date(customer.createdAt) : new Date();
    const now = new Date();
    const yearsDiff = now.getFullYear() - createdDate.getFullYear();
    const monthsDiff = now.getMonth() - createdDate.getMonth();
    const total = yearsDiff * 12 + monthsDiff;
    return Math.max(1, Math.min(36, total + 3)); // show at least 3 historical months
  }, [customer.createdAt]);

  // Generate monthly trajectory points for the sparkline chart
  const trajectoryData = useMemo(() => {
    const points: {
      month: number;
      label: string;
      cumulativeRevenue: number;
      monthlyRevenue: number;
      isHistorical: boolean;
    }[] = [];

    const frequencyMultiplier =
      config.billingFrequency === 'quarterly' ? 3 : config.billingFrequency === 'annual' ? 12 : 1;

    let runningTotal = config.upfrontValue;

    const startDate = customer.createdAt ? new Date(customer.createdAt) : new Date();

    for (let m = 1; m <= config.expectedLifespanMonths; m++) {
      let monthlyRev = 0;
      if (m === 1) {
        monthlyRev += config.upfrontValue;
      }

      // Check if billing occurs this month based on cadence
      if ((m - 1) % frequencyMultiplier === 0) {
        monthlyRev += config.monthlyRetainer * frequencyMultiplier;
      }

      runningTotal += (m === 1 ? config.monthlyRetainer * frequencyMultiplier : (m - 1) % frequencyMultiplier === 0 ? config.monthlyRetainer * frequencyMultiplier : 0);

      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + (m - 1));
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      points.push({
        month: m,
        label: `M${m} (${monthLabel})`,
        cumulativeRevenue: runningTotal,
        monthlyRevenue: monthlyRev,
        isHistorical: m <= monthsElapsed,
      });
    }

    return points;
  }, [config, monthsElapsed, customer.createdAt]);

  // Calculate total LTV metrics
  const totalLTV = trajectoryData[trajectoryData.length - 1]?.cumulativeRevenue || 0;
  const grossProfitLTV = Math.round(totalLTV * (config.marginPct / 100));

  const historicalRevenue = useMemo(() => {
    const histPoints = trajectoryData.filter((p) => p.isHistorical);
    return histPoints.length > 0 ? histPoints[histPoints.length - 1].cumulativeRevenue : config.upfrontValue;
  }, [trajectoryData, config.upfrontValue]);

  const projectedRevenue = totalLTV - historicalRevenue;

  // Sparkline Chart Geometry & Path calculation
  const chartHeight = 64;
  const chartWidth = 320;
  const padding = 6;

  const maxVal = Math.max(...trajectoryData.map((d) => d.cumulativeRevenue), 1);
  const minVal = 0;

  const getX = (index: number) => {
    if (trajectoryData.length <= 1) return padding;
    return padding + (index / (trajectoryData.length - 1)) * (chartWidth - padding * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);
  };

  // Build SVG path strings
  const fullPathPoints = trajectoryData.map((d, i) => `${getX(i)},${getY(d.cumulativeRevenue)}`).join(' L ');
  const fullPathD = `M ${fullPathPoints}`;

  const historicalIndices = trajectoryData
    .map((d, i) => (d.isHistorical ? i : null))
    .filter((idx): idx is number => idx !== null);

  const lastHistIdx = historicalIndices.length > 0 ? historicalIndices[historicalIndices.length - 1] : 0;

  // Path for historical segment
  const histPathPoints = trajectoryData
    .slice(0, lastHistIdx + 1)
    .map((d, i) => `${getX(i)},${getY(d.cumulativeRevenue)}`)
    .join(' L ');

  const histAreaD = `M ${getX(0)},${chartHeight} L ${histPathPoints} L ${getX(lastHistIdx)},${chartHeight} Z`;

  // Currently active or hovered point details
  const activePointIndex = hoveredPointIndex !== null ? hoveredPointIndex : lastHistIdx;
  const activePoint = trajectoryData[activePointIndex] || trajectoryData[0];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-50 via-white to-rose-50/30 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-rose-950/20 border border-zinc-200/90 dark:border-zinc-800 shadow-sm transition-all mb-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
                Customer Lifetime Value (LTV)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Calculated LTV
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Contract value &amp; projected recurring billing trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdjustControls(!showAdjustControls)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showAdjustControls
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Sliders size={13} />
            <span>{showAdjustControls ? 'Hide Controls' : 'Adjust Formula'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row & Sparkline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: Highlighted LTV Metrics */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
          {/* Total LTV Card */}
          <div className="col-span-2 p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
              <span>Total Estimated LTV</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={12} /> {config.marginPct}% Gross Margin
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-mono">
                {currencySymbol}
                {totalLTV.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                / {config.expectedLifespanMonths} mos
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Profit: {currencySymbol}{grossProfitLTV.toLocaleString()}
              </span>
              <span>•</span>
              <span className="capitalize">{config.billingFrequency} Billing</span>
            </div>
          </div>

          {/* Realized Revenue */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Realized To-Date
            </span>
            <span className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
              {currencySymbol}
              {historicalRevenue.toLocaleString()}
            </span>
            <span className="block text-[10px] text-zinc-400">
              {Math.round((historicalRevenue / (totalLTV || 1)) * 100)}% of Total LTV
            </span>
          </div>

          {/* Monthly Retainer */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Monthly Retainer
            </span>
            <span className="block text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              {currencySymbol}
              {config.monthlyRetainer.toLocaleString()}
              <span className="text-[10px] text-zinc-400 font-normal">/mo</span>
            </span>
            <span className="block text-[10px] text-zinc-400">
              + {currencySymbol}{config.upfrontValue.toLocaleString()} Upfront
            </span>
          </div>
        </div>

        {/* Right: Sparkline Chart Box */}
        <div className="lg:col-span-7 p-3 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-300 mb-1">
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-rose-500 fill-rose-500/20" />
              <span>Cumulative Revenue Trajectory</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-normal">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Historical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-dashed border-rose-400 inline-block" /> Projected
              </span>
            </div>
          </div>

          {/* SVG Sparkline Container */}
          <div className="relative py-1 my-1">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-16 overflow-visible cursor-crosshair"
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <defs>
                <linearGradient id="ltvHistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="ltvLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* Background Grid Guide Lines */}
              <line
                x1={padding}
                y1={getY(maxVal * 0.5)}
                x2={chartWidth - padding}
                y2={getY(maxVal * 0.5)}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800"
                strokeDasharray="2 2"
                strokeWidth="1"
              />

              {/* Historical Fill Area */}
              <path d={histAreaD} fill="url(#ltvHistGradient)" />

              {/* Full Trajectory Path (Dashed for projected portion) */}
              <path
                d={fullPathD}
                fill="none"
                stroke="#fda4af"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Historical Path (Solid Line) */}
              <path
                d={`M ${histPathPoints}`}
                fill="none"
                stroke="url(#ltvLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {trajectoryData.map((d, idx) => {
                const cx = getX(idx);
                const cy = getY(d.cumulativeRevenue);
                const isHovered = activePointIndex === idx;

                return (
                  <g key={idx} className="transition-transform">
                    {/* Vertical guideline on hover */}
                    {isHovered && (
                      <line
                        x1={cx}
                        y1={padding}
                        x2={cx}
                        y2={chartHeight}
                        stroke="#f43f5e"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.7"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 4.5 : d.isHistorical ? 2.5 : 2}
                      fill={isHovered ? '#f43f5e' : d.isHistorical ? '#e11d48' : '#ffffff'}
                      stroke={d.isHistorical ? '#ffffff' : '#f43f5e'}
                      strokeWidth={isHovered ? 2 : 1}
                      className="cursor-pointer transition-all hover:scale-125"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sparkline Point Info Bar */}
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {activePoint.label} {activePoint.isHistorical ? ' (Realized)' : ' (Projected)'}
            </span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              Cumulative: {currencySymbol}
              {activePoint.cumulativeRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Adjust Formula Sliders Panel */}
      {showAdjustControls && (
        <div className="mt-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sliders size={14} className="text-rose-500" /> Customize LTV Parameters
            </h5>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Upfront Fee Slider */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Upfront Deal / Deposit
              </label>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={config.upfrontValue}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      upfrontValue: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(50000, config.upfrontValue * 2)}
                step="250"
                value={config.upfrontValue}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, upfrontValue: Number(e.target.value) }))
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Monthly Retainer Slider */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Monthly Retainer (MRR)
              </label>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={config.monthlyRetainer}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      monthlyRetainer: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-400"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={config.monthlyRetainer}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, monthlyRetainer: Number(e.target.value) }))
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Expected Lifespan Slider */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Expected Tenure ({config.expectedLifespanMonths} mos)
              </label>
              <div className="flex items-center gap-2 mb-1.5">
                <input
                  type="number"
                  value={config.expectedLifespanMonths}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      expectedLifespanMonths: Math.max(1, Math.min(60, Number(e.target.value))),
                    }))
                  }
                  className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
                <span className="text-[11px] text-zinc-400">Months</span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="1"
                value={config.expectedLifespanMonths}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, expectedLifespanMonths: Number(e.target.value) }))
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Billing Frequency & Margin */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                  Billing Cadence
                </label>
                <select
                  value={config.billingFrequency}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      billingFrequency: e.target.value as any,
                    }))
                  }
                  className="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="monthly">Monthly Recurring</option>
                  <option value="quarterly">Quarterly Renewal</option>
                  <option value="annual">Annual Contract</option>
                </select>
              </div>

              <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Gross Margin %</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={config.marginPct}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      marginPct: Math.max(1, Math.min(100, Number(e.target.value))),
                    }))
                  }
                  className="w-12 px-1 py-0.5 text-right font-mono font-bold rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
