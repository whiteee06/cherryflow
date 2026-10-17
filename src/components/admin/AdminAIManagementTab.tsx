import React, { useState } from 'react';
import {
  Bot,
  Zap,
  Sliders,
  Gauge,
  Activity,
  DollarSign,
  Cpu,
  CheckCircle2,
  Server,
  RefreshCw,
} from 'lucide-react';

export const AdminAIManagementTab: React.FC = () => {
  const [defaultModel, setDefaultModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState('0.7');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are CherryFlow AI Copilot, a multi-tenant business operating system assistant. Provide concise, structured, and actionable guidance.'
  );

  const [freeRateLimit, setFreeRateLimit] = useState('50');
  const [starterRateLimit, setStarterRateLimit] = useState('500');
  const [proRateLimit, setProRateLimit] = useState('2000');
  const [enterpriseRateLimit, setEnterpriseRateLimit] = useState('20000');

  const [notice, setNotice] = useState<string | null>(null);

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

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Total Monthly Tokens</span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">89,400,000</div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">@google/genai SDK</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Estimated API Cost</span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">$142.10 / mo</div>
          <span className="text-[11px] text-emerald-600 font-bold">High Cost-Efficiency Ratio</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Average Latency</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">42 ms</div>
          <span className="text-[11px] text-zinc-400">Streamed Server-Side Routes</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Active Provider</span>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Gemini API</span>
          </div>
          <span className="text-[11px] text-zinc-400">GEMINI_API_KEY Configured</span>
        </div>
      </div>

      {/* Model Configuration Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Global Gemini Model Pipeline Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Primary AI Model Alias *
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended for Speed &amp; Reasoning)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (For Complex Multimodal &amp; Coding tasks)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Sampling Temperature ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="text-[11px] text-zinc-400 block mt-1">
              Lower (0.1) for strictly deterministic factual analysis; Higher (0.9) for creative text generation.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Default Base System Instructions
          </label>
          <textarea
            rows={3}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => triggerNotice('Successfully updated Gemini model pipeline configuration!')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Save Model Configuration
          </button>
        </div>
      </div>

      {/* Rate Limits per Tier */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            AI Token Rate Limits per Subscription Tier (Requests / Mo)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-xs uppercase text-zinc-500 block">Free Tier</span>
            <input
              type="number"
              value={freeRateLimit}
              onChange={(e) => setFreeRateLimit(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-zinc-400 block">Prompts / Mo</span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-xs uppercase text-zinc-500 block">Starter Tier</span>
            <input
              type="number"
              value={starterRateLimit}
              onChange={(e) => setStarterRateLimit(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-zinc-400 block">Prompts / Mo</span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-xs uppercase text-zinc-500 block">Professional Tier</span>
            <input
              type="number"
              value={proRateLimit}
              onChange={(e) => setProRateLimit(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-zinc-400 block">Prompts / Mo</span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-xs uppercase text-zinc-500 block">Enterprise Tier</span>
            <input
              type="number"
              value={enterpriseRateLimit}
              onChange={(e) => setEnterpriseRateLimit(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-zinc-400 block">Prompts / Mo</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => triggerNotice('Saved Tier Rate Limits successfully!')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Save Tier Rate Limits
          </button>
        </div>
      </div>
    </div>
  );
};
