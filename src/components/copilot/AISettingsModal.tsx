import React, { useState } from 'react';
import { AISettings, AIProvider } from '../../types';
import { X, Sliders, Cpu, Key, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [provider, setProvider] = useState<AIProvider>(settings.provider);
  const [model, setModel] = useState<string>(settings.model);
  const [temperature, setTemperature] = useState<number>(settings.temperature);
  const [maxTokens, setMaxTokens] = useState<number>(settings.maxTokens);
  const [systemPrompt, setSystemPrompt] = useState<string>(settings.systemPrompt);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      provider,
      model,
      temperature,
      maxTokens,
      systemPrompt,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const modelOptions =
    provider === 'gemini'
      ? [
          { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (Fast & Intelligent - Recommended)' },
          { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview (Complex Reasoning)' },
          { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (Ultra Low Latency)' },
        ]
      : provider === 'openai'
      ? [
          { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
          { value: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
        ]
      : [
          { value: 'claude-3-5-sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
          { value: 'claude-3-haiku', label: 'Anthropic Claude 3 Haiku' },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              AI Business Assistant Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              AI Provider Architecture
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setModel('gemini-3.6-flash');
                }}
                className={`p-3 rounded-2xl border text-center transition font-semibold cursor-pointer ${
                  provider === 'gemini'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="font-bold">Google Gemini</div>
                <div className="text-[10px] opacity-70">Native SDK</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setModel('gpt-4o');
                }}
                className={`p-3 rounded-2xl border text-center transition font-semibold cursor-pointer ${
                  provider === 'openai'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="font-bold">OpenAI</div>
                <div className="text-[10px] opacity-70">Modular API</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('claude');
                  setModel('claude-3-5-sonnet');
                }}
                className={`p-3 rounded-2xl border text-center transition font-semibold cursor-pointer ${
                  provider === 'claude'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="font-bold">Anthropic</div>
                <div className="text-[10px] opacity-70">Claude API</div>
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Model Selection
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {modelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">
                Temperature (Creativity Ratio)
              </label>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>0.0 (Precise & Analytical)</span>
              <span>1.0 (Creative & Expressive)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Max Response Tokens Limit
            </label>
            <input
              type="number"
              min="256"
              max="8192"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* System Prompt Customizer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400">
                System Instructions Persona
              </label>
              <button
                type="button"
                onClick={() =>
                  setSystemPrompt(
                    'You are CherryFlow AI, a top-tier executive business advisor and AI copilot. You help business owners, freelancers, and sales teams draft client communications, formulate growth strategies, organize deliverables, summarize customer interactions, and generate actionable tasks.'
                  )
                }
                className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} /> Reset Default
              </button>
            </div>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <AlertCircle size={12} /> Key managed securely in server environment
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
              >
                {isSaved ? <Check size={14} /> : null}
                <span>{isSaved ? 'Saved!' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
