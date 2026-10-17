import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, CheckCircle2 } from 'lucide-react';

interface LiveChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onLaunchApp: () => void;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  onToggle,
  onLaunchApp,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: '👋 Hi there! Welcome to CherryFlow. How can I help you explore our operations engine or answer questions about pricing?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply =
        'Thanks for reaching out! CherryFlow replaces CRM, tasks, AI notes, and billing with one unified engine.';
      if (userText.toLowerCase().includes('price') || userText.toLowerCase().includes('pricing') || userText.toLowerCase().includes('cost')) {
        reply =
          'We offer a Free plan forever, Starter at $15/mo, Pro at $39/mo (most popular), and Business at $79/mo. All paid plans include a 14-day trial!';
      } else if (userText.toLowerCase().includes('trial') || userText.toLowerCase().includes('free')) {
        reply = 'You can start using CherryFlow instantly with no credit card required. Click "Launch App" at the top to try it live right now!';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={onToggle}
          id="chat-widget-toggle-btn"
          className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer relative"
          aria-label="Open Live Chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">CherryFlow Assistant</h4>
                <span className="text-[10px] text-rose-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online • Typically replies instantly
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-zinc-50 dark:bg-zinc-950 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Prompt */}
          <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={onLaunchApp}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 cursor-pointer"
            >
              Launch Live App →
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              id="live-chat-input"
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              id="live-chat-send-btn"
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
