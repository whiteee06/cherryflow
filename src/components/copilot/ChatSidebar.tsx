import React, { useState } from 'react';
import { ChatSession } from '../../types';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onPinSession: (id: string, pinned: boolean) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onPinSession,
  onOpenSettings,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filtered.filter((s) => s.pinned);
  const recentSessions = filtered.filter((s) => !s.pinned);

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col items-center py-4 gap-4 shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          title="Expand Chat History Sidebar"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={onNewSession}
          className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer"
          title="Create New Conversation"
        >
          <Plus size={18} />
        </button>

        <div className="w-8 h-px bg-zinc-200 dark:border-zinc-800 my-1" />

        <div className="flex-1 space-y-2 overflow-y-auto w-full px-2">
          {sessions.slice(0, 8).map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeSessionId === s.id
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={s.title}
            >
              <MessageSquare size={16} />
            </button>
          ))}
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title="AI Settings"
        >
          <Sliders size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
          <Sparkles size={18} className="text-rose-600 dark:text-rose-400" />
          <span>Conversations</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Plus size={16} /> New Business Chat
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Pin size={10} className="text-rose-500" /> Pinned Chats
            </div>
            <div className="space-y-1 mt-1">
              {pinnedSessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  isEditing={editingId === s.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={() => onSelectSession(s.id)}
                  onStartRename={(e) => startRename(s, e)}
                  onSaveRename={(e) => saveRename(s.id, e)}
                  onCancelRename={() => setEditingId(null)}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    onPinSession(s.id, false);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Recent Conversations ({recentSessions.length})
          </div>
          <div className="space-y-1 mt-1">
            {recentSessions.length === 0 ? (
              <p className="text-[11px] text-zinc-400 px-2 py-3">No conversations found.</p>
            ) : (
              recentSessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  isActive={activeSessionId === s.id}
                  isEditing={editingId === s.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={() => onSelectSession(s.id)}
                  onStartRename={(e) => startRename(s, e)}
                  onSaveRename={(e) => saveRename(s.id, e)}
                  onCancelRename={() => setEditingId(null)}
                  onTogglePin={(e) => {
                    e.stopPropagation();
                    onPinSession(s.id, true);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Settings Link */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onOpenSettings}
          className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-rose-500" />
            <span>AI Provider & Model</span>
          </div>
          <span className="text-[10px] text-zinc-400 uppercase">Config</span>
        </button>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent) => void;
  onCancelRename: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}) => {
  if (isEditing) {
    return (
      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-rose-500 flex items-center gap-1">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-white focus:outline-hidden"
          autoFocus
        />
        <button onClick={onSaveRename} className="p-1 text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">
          <Check size={13} />
        </button>
        <button onClick={onCancelRename} className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group p-2.5 rounded-2xl flex items-center justify-between transition cursor-pointer ${
        isActive
          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200/80 dark:border-rose-800/60 shadow-xs'
          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <MessageSquare size={14} className={isActive ? 'text-rose-600' : 'text-zinc-400'} />
        <span className="truncate text-xs">{session.title}</span>
      </div>

      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          onClick={onTogglePin}
          className="p-1 text-zinc-400 hover:text-rose-600 transition"
          title={session.pinned ? 'Unpin Chat' : 'Pin Chat'}
        >
          <Pin size={12} className={session.pinned ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
        <button
          onClick={onStartRename}
          className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
          title="Rename Chat"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-zinc-400 hover:text-rose-600 transition"
          title="Delete Chat"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};
