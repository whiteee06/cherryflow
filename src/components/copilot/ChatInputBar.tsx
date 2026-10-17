import React, { useState, useRef, useEffect } from 'react';
import { Customer, Note } from '../../types';
import {
  Send,
  Square,
  Sparkles,
  Users,
  FileText,
  Paperclip,
  Sliders,
  ChevronUp,
  X,
} from 'lucide-react';

interface ChatInputBarProps {
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  onSend: () => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  customers: Customer[];
  notes: Note[];
  selectedModel: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputPrompt,
  setInputPrompt,
  onSend,
  isGenerating,
  onStopGeneration,
  onOpenTemplates,
  onOpenSettings,
  customers,
  notes,
  selectedModel,
}) => {
  const [attachedContext, setAttachedContext] = useState<string | null>(null);
  const [showContextPicker, setShowContextPicker] = useState<'none' | 'customer' | 'note'>('none');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating) return;
      handleSendWithContext();
    }
  };

  const handleSendWithContext = () => {
    if (!inputPrompt.trim() && !attachedContext) return;
    let finalPrompt = inputPrompt.trim();
    if (attachedContext) {
      finalPrompt = `${finalPrompt}\n\n[ATTACHED BUSINESS CONTEXT]:\n${attachedContext}`;
    }
    setInputPrompt(finalPrompt);
    setTimeout(() => {
      onSend();
      setAttachedContext(null);
      setShowContextPicker('none');
    }, 50);
  };

  const attachCustomerContext = (cust: Customer) => {
    setAttachedContext(
      `Customer: ${cust.name} (${cust.company})\nStatus: ${cust.status}, Deal Value: $${cust.dealValue}\nEmail: ${cust.email}, Phone: ${cust.phone}\nNotes: ${cust.notes || 'N/A'}`
    );
    setShowContextPicker('none');
  };

  const attachNoteContext = (note: Note) => {
    setAttachedContext(
      `Business Note: "${note.title}" (${note.category})\nContent: ${note.content}`
    );
    setShowContextPicker('none');
  };

  return (
    <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-2">
      {/* Context Picker Dropdown */}
      {showContextPicker !== 'none' && (
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl max-h-48 overflow-y-auto space-y-1.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white">
            <span>
              {showContextPicker === 'customer' ? 'Select Customer Context' : 'Select Note Context'}
            </span>
            <button
              onClick={() => setShowContextPicker('none')}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {showContextPicker === 'customer' ? (
            customers.length === 0 ? (
              <p className="text-[11px] text-zinc-400 py-2">No customers found.</p>
            ) : (
              customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => attachCustomerContext(c)}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white">{c.company}</span>
                    <span className="text-[11px] text-zinc-500 ml-2">({c.name})</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 uppercase">
                    ${c.dealValue}
                  </span>
                </div>
              ))
            )
          ) : notes.length === 0 ? (
            <p className="text-[11px] text-zinc-400 py-2">No notes found.</p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                onClick={() => attachNoteContext(n)}
                className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white">{n.title}</span>
                  <span className="text-[11px] text-zinc-500 ml-2">[{n.category}]</span>
                </div>
                <span className="text-[10px] text-zinc-400">Attach</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Attached Context Pill */}
      {attachedContext && (
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2 truncate">
            <Paperclip size={14} className="shrink-0 text-rose-600" />
            <span className="font-bold truncate">{attachedContext.slice(0, 80)}...</span>
          </div>
          <button
            onClick={() => setAttachedContext(null)}
            className="p-1 rounded-lg hover:bg-rose-200/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Action Chips Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-semibold scrollbar-none pb-0.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-1 transition cursor-pointer"
          >
            <Sparkles size={12} /> Prompt Library
          </button>

          <button
            type="button"
            onClick={() =>
              setShowContextPicker(showContextPicker === 'customer' ? 'none' : 'customer')
            }
            className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
          >
            <Users size={12} /> + Customer
          </button>

          <button
            type="button"
            onClick={() => setShowContextPicker(showContextPicker === 'note' ? 'none' : 'note')}
            className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
          >
            <FileText size={12} /> + Note
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 shrink-0 cursor-pointer text-[10px]"
          title="AI Model Configuration"
        >
          <Sliders size={11} /> {selectedModel}
        </button>
      </div>

      {/* Main Textarea Input Container */}
      <div className="relative flex items-end gap-2 p-2.5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Ask CherryFlow AI... (e.g. 'Draft an outreach email to Apex Tech for a $15k project')"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-0 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden resize-none max-h-44 py-1"
        />

        {isGenerating ? (
          <button
            type="button"
            onClick={onStopGeneration}
            className="p-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition cursor-pointer shrink-0"
            title="Stop Generation"
          >
            <Square size={14} className="fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendWithContext}
            disabled={!inputPrompt.trim() && !attachedContext}
            className={`p-2.5 rounded-2xl font-bold transition cursor-pointer shrink-0 ${
              inputPrompt.trim() || attachedContext
                ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
