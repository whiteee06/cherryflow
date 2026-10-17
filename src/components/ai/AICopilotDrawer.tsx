import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  TrendingUp,
  FileText,
  Users,
  CheckSquare,
  Bot,
  User,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Customer, Task, Note, BusinessOverview } from '../../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  tasks: Task[];
  notes: Note[];
  overview: BusinessOverview;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  customers,
  tasks,
  notes,
  overview,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I am **CherryFlow AI**, your executive business copilot.
I have full context on your **${customers.length} customer accounts**, **${tasks.length} active tasks**, and **${notes.length} strategy notes**.

How can I help accelerate your business today?
- **Audit Pipeline**: Analyze deal progression and recommend high-leverage follow-ups.
- **Weekly Strategy**: Draft an executive brief for team priorities.
- **Outreach & Copy**: Generate proposals, ad copy, or customer update emails.`,
      time: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            monthlyRevenue: overview.monthlyRevenue,
            customerCount: customers.length,
            vipClients: customers.filter((c) => c.status === 'vip').map((c) => c.company),
            pendingTasks: tasks.filter((t) => t.status !== 'completed').map((t) => t.title),
            noteTitles: notes.map((n) => n.title),
          },
        }),
      });

      const data = await res.json();
      const aiReply: Message = {
        sender: 'ai',
        text: data.result || 'I apologize, I was unable to generate a response. Please check your Gemini API key.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const errorReply: Message = {
        sender: 'ai',
        text: `Error contacting AI Copilot: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Analyze my customer pipeline & recommend top 3 focus deals',
    'Draft a weekly status email for my active VIP clients',
    'Generate a high-priority action checklist for this week',
    'Suggest strategic pricing tiers for digital service packages',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-800 text-zinc-100 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              CherryFlow <span className="text-rose-500">AI Copilot</span>
            </h3>
            <p className="text-[10px] text-zinc-400">Executive Strategic Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-zinc-800 border border-zinc-700 text-rose-400'
              }`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-rose-600 text-white font-medium rounded-tr-xs'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-xs whitespace-pre-line'
              }`}
            >
              {msg.text}
              <div
                className={`text-[9px] mt-1.5 text-right font-mono ${
                  msg.sender === 'user' ? 'text-rose-200' : 'text-zinc-500'
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-zinc-900 rounded-2xl border border-zinc-800 w-fit">
            <RefreshCw size={14} className="animate-spin" />
            <span>CherryFlow AI is analyzing business context...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestions & Input Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/90 space-y-3">
        {/* Quick Suggestion Chips */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-semibold text-zinc-500">Quick Strategic Actions</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(qp)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 whitespace-nowrap cursor-pointer transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask CherryFlow AI anything about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt();
            }}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-zinc-800/90 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all cursor-pointer shadow-md shadow-rose-600/30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
