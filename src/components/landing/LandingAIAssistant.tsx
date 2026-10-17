import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Send,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  FileText,
  BarChart,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';

interface LandingAIAssistantProps {
  onTabChange: (tab: LandingPageTab) => void;
  onLaunchApp: () => void;
}

export const LandingAIAssistant: React.FC<LandingAIAssistantProps> = ({
  onTabChange,
  onLaunchApp,
}) => {
  const [prompt, setPrompt] = useState('Summarize our Q3 CRM deals and flag any at-risk accounts');
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(
    `📊 **Q3 CRM Pipeline Summary**:
• **Total Pipeline**: $485,000 across 12 active deals.
• **Top Probability**: Nexus Global ($215k, 85% close rate).
⚠️ **At-Risk Alert**: Acme Corp ($120k) has had no activity for 7 days.
💡 **Recommended Action**: Created follow-up email draft for Sarah Chen and scheduled reminder task for tomorrow 10:00 AM.`
  );

  const samplePrompts = [
    'Summarize our Q3 CRM deals and flag any at-risk accounts',
    'Draft a personalized outreach email to Nexus Global for $215k renewal',
    'Create a 5-step onboarding workflow rule for new Enterprise leads',
    'Generate an executive briefing report for this month\'s MRR growth',
  ];

  const handleRunPrompt = (text: string) => {
    setPrompt(text);
    setIsSimulating(true);
    setAiOutput(null);

    setTimeout(() => {
      setIsSimulating(false);
      if (text.includes('outreach email')) {
        setAiOutput(
          `✉️ **Draft Email Subject**: Partnership Renewal & Executive Review - Nexus Global\n\nHi Alex,\n\nHope your week is off to a great start! Following up on our $215k expansion proposal. Our team has prepared the custom security SLA details you requested.\n\nWould you be open to a 10-min catch-up this Thursday?\n\nBest,\nSarah Chen`
        );
      } else if (text.includes('workflow rule')) {
        setAiOutput(
          `⚡ **Workflow Rule Generated**:\n• **Trigger**: Deal Stage → "Closed Won"\n• **Condition**: Deal Value > $50,000\n• **Action 1**: Assign dedicated Customer Success Manager\n• **Action 2**: Create high-priority task "Setup Dedicated SSO Cluster"\n• **Action 3**: Send Slack celebration alert`
        );
      } else {
        setAiOutput(
          `📈 **Executive Briefing Report**:\n• **Current MRR**: $48,200 (+24% MoM)\n• **Task Completion Velocity**: 142 completed items/week\n• **Customer Churn**: 0.4% (Industry benchmark: 2.1%)\n• **Key Driver**: Pro plan adoption increased by 38% following Gemini Copilot rollout.`
        );
      }
    }, 1200);
  };

  return (
    <div className="py-24 bg-zinc-950 text-white min-h-screen relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Powered by Google Gemini Models</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Meet Your Business <br />
            <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              AI Copilot
            </span>
          </h1>
          <p className="text-zinc-400 text-lg">
            CherryFlow AI connects directly to your live CRM, tasks, notes, and analytics — giving you instant answers, automated outreach, and predictive deal alerts.
          </p>
        </div>

        {/* Live Interactive Prompt Sandbox */}
        <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Interactive Gemini Copilot Sandbox</h3>
                <p className="text-xs text-zinc-400">Test live prompt capabilities on your operational dataset</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800">
              gemini-2.5-flash
            </span>
          </div>

          {/* Preset Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Try Preset Prompts:</span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunPrompt(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                    prompt === p
                      ? 'bg-rose-600 text-white border-rose-500 font-semibold'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) handleRunPrompt(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Cherry Copilot anything..."
              id="ai-sandbox-input"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={isSimulating}
              id="ai-sandbox-submit-btn"
              className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Execute</span>
            </button>
          </form>

          {/* Output Window */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 min-h-[160px] font-sans text-sm relative">
            {isSimulating ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-rose-400">
                <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
                <span className="text-xs font-mono text-zinc-400">Gemini analyzing workspace memory...</span>
              </div>
            ) : aiOutput ? (
              <div className="whitespace-pre-wrap text-zinc-200 leading-relaxed animate-in fade-in">
                {aiOutput}
              </div>
            ) : null}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Try full AI capabilities in the app workspace</span>
            <button
              onClick={onLaunchApp}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Launch Full Copilot App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
