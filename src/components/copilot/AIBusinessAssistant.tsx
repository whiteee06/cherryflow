import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage, AISettings, Customer, Note } from '../../types';
import { ChatService } from '../../services/ChatService';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar } from './ChatInputBar';
import { AISettingsModal } from './AISettingsModal';
import { PromptTemplatesModal } from './PromptTemplatesModal';
import {
  Sparkles,
  Bot,
  Sliders,
  RotateCcw,
  Mail,
  FileText,
  CheckSquare,
  Users,
  Megaphone,
  Lightbulb,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface AIBusinessAssistantProps {
  customers: Customer[];
  notes: Note[];
  onRefreshTasksAndNotes?: () => void;
}

export const AIBusinessAssistant: React.FC<AIBusinessAssistantProps> = ({
  customers,
  notes,
  onRefreshTasksAndNotes,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings>(ChatService.getSettings());

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Abort controller reference for stopping streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Sessions on Mount
  useEffect(() => {
    const loadSessions = async () => {
      const fetchedSessions = await ChatService.getSessions();
      setSessions(fetchedSessions);
      if (fetchedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(fetchedSessions[0].id);
      }
    };
    loadSessions();
  }, []);

  // Load Messages when Active Session Changes
  useEffect(() => {
    if (!activeSessionId) return;
    const loadMsgs = async () => {
      const fetchedMsgs = await ChatService.getMessages(activeSessionId);
      setMessages(fetchedMsgs);
    };
    loadMsgs();
  }, [activeSessionId]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Handlers for Session Management
  const handleNewSession = async () => {
    const newSession = await ChatService.createSession('New Business Chat', aiSettings);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    await ChatService.updateSession(id, { title: newTitle });
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleDeleteSession = async (id: string) => {
    await ChatService.deleteSession(id);
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        handleNewSession();
      }
    }
  };

  const handlePinSession = async (id: string, pinned: boolean) => {
    await ChatService.updateSession(id, { pinned });
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned } : s))
    );
  };

  const handleClearMessages = async () => {
    if (!activeSessionId) return;
    if (window.confirm('Are you sure you want to clear conversation history in this chat?')) {
      await ChatService.clearMessages(activeSessionId);
      setMessages([]);
    }
  };

  // Main Streaming Handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || !activeSessionId || isGenerating) return;

    setInputPrompt('');
    setIsGenerating(true);

    // 1. Save and display user message
    const userMsg = await ChatService.addMessage({
      sessionId: activeSessionId,
      role: 'user',
      content: textToSend.trim(),
    });

    setMessages((prev) => [...prev, userMsg]);

    // Update title if session title is still generic
    if (activeSession && (activeSession.title === 'New Business Chat' || activeSession.title === 'New Conversation')) {
      const autoTitle = textToSend.trim().slice(0, 32) + '...';
      handleRenameSession(activeSessionId, autoTitle);
    }

    // 2. Prepare streaming assistant placeholder
    const assistantMsgId = `msg_stream_${Date.now()}`;
    const placeholderAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, placeholderAssistantMsg]);

    // Setup AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build history payload (exclude system placeholder)
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
          model: aiSettings.model,
          temperature: aiSettings.temperature,
          systemPrompt: aiSettings.systemPrompt,
          provider: aiSettings.provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server HTTP Error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming response body unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch (err) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      // Save final message to storage
      await ChatService.addMessage({
        sessionId: activeSessionId,
        role: 'assistant',
        content: accumulatedText || 'I have analyzed your request. How else can I assist your business growth?',
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user.');
      } else {
        const errorText = `⚠️ **AI Service Error**: ${err.message}\n\nPlease check your server connection or process configuration.`;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: errorText } : m))
        );
        await ChatService.addMessage({
          sessionId: activeSessionId,
          role: 'assistant',
          content: errorText,
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleSaveAISettings = (newSettings: AISettings) => {
    const saved = ChatService.saveSettings(newSettings);
    setAiSettings(saved);
  };

  // Quick Start Suggested Cards
  const suggestedPrompts = [
    {
      title: 'Draft Client Sales Email',
      desc: 'High-converting outreach for new leads',
      icon: <Mail size={16} className="text-rose-500" />,
      prompt: 'Draft a friendly sales outreach email to a potential client interested in our consulting services.',
    },
    {
      title: 'Write Business Proposal',
      desc: 'Scope of work, deliverables & timeline',
      icon: <FileText size={16} className="text-blue-500" />,
      prompt: 'Write a professional business proposal for website redesign and digital marketing services.',
    },
    {
      title: 'Summarize Customer Notes',
      desc: 'Extract key takeaways & decisions',
      icon: <Users size={16} className="text-purple-500" />,
      prompt: 'Analyze our latest customer meeting notes and extract key decision points and follow-up deadlines.',
    },
    {
      title: 'Generate Tasks & Action Steps',
      desc: 'Auto-convert notes into actionable tasks',
      icon: <CheckSquare size={16} className="text-emerald-500" />,
      prompt: 'Extract 5 prioritized actionable tasks with estimated completion duration from our Q3 strategy document.',
    },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-zinc-50/50 dark:bg-zinc-950/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onPinSession={handlePinSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{activeSession?.title || 'CherryFlow AI Business Assistant'}</span>
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Model: <span className="font-semibold text-rose-600 dark:text-rose-400">{aiSettings.model}</span> • Temperature: {aiSettings.temperature}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearMessages}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Clear Conversation History"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="AI Settings"
            >
              <Sliders size={16} />
            </button>
          </div>
        </div>

        {/* Messages or Empty State */}
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-600/10">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              CherryFlow Business Assistant
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1 mb-8">
              Your intelligent copilot for drafting proposals, writing sales outreach emails, analyzing customer history, and generating real tasks into your Task Hub.
            </p>

            {/* Suggested Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              {suggestedPrompts.map((card, i) => (
                <div
                  key={i}
                  onClick={() => handleSendMessage(card.prompt)}
                  className="p-4 rounded-2xl bg-zinc-50 hover:bg-rose-50/60 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-500/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-white mb-1">
                    {card.icon}
                    <span>{card.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Try prompt</span>
                    <ArrowRight size={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onRefreshTasksAndNotes={onRefreshTasksAndNotes}
          />
        )}

        {/* Input Bar */}
        <ChatInputBar
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          onSend={() => handleSendMessage()}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          customers={customers}
          notes={notes}
          selectedModel={aiSettings.model}
        />
      </div>

      {/* Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={handleSaveAISettings}
      />

      {/* Prompt Templates Library Modal */}
      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(promptText) => {
          setInputPrompt(promptText);
        }}
      />
    </div>
  );
};
