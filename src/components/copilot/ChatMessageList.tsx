import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Customer, Note } from '../../types';
import { TaskService } from '../../services/TaskService';
import { NoteService } from '../../services/NoteService';
import {
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  CheckSquare,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onRefreshTasksAndNotes?: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isGenerating,
  onRegenerate,
  onRefreshTasksAndNotes,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleConvertToTask = async (content: string) => {
    try {
      // Extract first line as title or generic title
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const title = lines[0]?.replace(/^[#*-\s]+/, '').slice(0, 70) || 'AI Generated Business Deliverable';

      await TaskService.createTask({
        title: `[AI] ${title}`,
        description: content,
        priority: 'high',
        status: 'todo',
        assignedUser: 'Owner',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        tags: ['AI Generated', 'Deliverable'],
        subtasks: [
          { id: `sub_${Date.now()}_1`, title: 'Review AI specifications & scope', completed: false },
          { id: `sub_${Date.now()}_2`, title: 'Execute action items', completed: false },
        ],
      });

      if (onRefreshTasksAndNotes) onRefreshTasksAndNotes();
      showNotification('✓ Task created in Task Hub!');
    } catch (e: any) {
      showNotification(`Failed to create task: ${e.message}`);
    }
  };

  const handleSaveAsNote = async (content: string) => {
    try {
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const title = lines[0]?.replace(/^[#*-\s]+/, '').slice(0, 60) || 'AI Assistant Insights';

      await NoteService.createNote({
        title: `[AI] ${title}`,
        content,
        category: 'Strategy',
      });

      if (onRefreshTasksAndNotes) onRefreshTasksAndNotes();
      showNotification('✓ Note saved to Business Notes!');
    } catch (e: any) {
      showNotification(`Failed to save note: ${e.message}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="sticky top-2 z-30 mx-auto max-w-sm px-4 py-2 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isLastAssistant =
          !isUser && (index === messages.length - 1 || (index === messages.length - 2 && isGenerating));

        return (
          <div
            key={msg.id || index}
            className={`flex items-start gap-3 max-w-3xl ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                isUser
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-rose-600 text-white shadow-rose-600/20'
              }`}
            >
              {isUser ? <User size={15} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`space-y-2 max-w-[88%] sm:max-w-[82%]`}>
              <div
                className={`p-4 rounded-3xl text-xs leading-relaxed border ${
                  isUser
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10 rounded-tr-xs'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-xs space-y-2 break-words">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                        h1: ({ children }) => (
                          <h1 className="text-sm font-black text-rose-600 dark:text-rose-400 mt-3 mb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold text-zinc-900 dark:text-white mt-3 mb-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2 mb-1">
                            {children}
                          </h3>
                        ),
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-bold text-zinc-900 dark:text-white">{children}</strong>
                        ),
                        code: ({ node, className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code
                              className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <div className="my-3 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 p-3 font-mono text-[11px] overflow-x-auto relative group">
                              <button
                                onClick={() => handleCopyText(msg.id, String(children))}
                                className="absolute right-2 top-2 p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                                title="Copy code"
                              >
                                {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>
                              <code>{children}</code>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Action Toolbar for Assistant Messages */}
              {!isUser && msg.content && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 px-1 text-[11px] text-zinc-500">
                  <button
                    onClick={() => handleCopyText(msg.id, msg.content)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1 font-semibold transition cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={12} className="text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleConvertToTask(msg.content)}
                    className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold transition cursor-pointer"
                  >
                    <CheckSquare size={12} /> Create Task
                  </button>

                  <button
                    onClick={() => handleSaveAsNote(msg.content)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1 font-semibold transition cursor-pointer"
                  >
                    <FileText size={12} /> Save Note
                  </button>

                  {isLastAssistant && !isGenerating && (
                    <button
                      onClick={onRegenerate}
                      className="px-2 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer ml-auto"
                      title="Regenerate Response"
                    >
                      <RefreshCw size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Generating Typing Indicator */}
      {isGenerating && (
        <div className="flex items-center gap-3 mr-auto max-w-xl animate-pulse">
          <div className="w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <Bot size={16} />
          </div>
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-xs flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
            <Sparkles size={14} className="text-rose-500 animate-spin" />
            <span>CherryFlow AI is generating answer...</span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
