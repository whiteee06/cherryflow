import React, { useState } from 'react';
import { Workspace } from '../../types';
import { Building2, ChevronDown, Plus, Check, Settings, Sparkles } from 'lucide-react';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspaceClick: () => void;
  onWorkspaceSettingsClick: () => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspaceClick,
  onWorkspaceSettingsClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-white border border-zinc-700/80 transition-all cursor-pointer text-xs font-semibold"
      >
        <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
          {activeWs?.name ? activeWs.name.charAt(0).toUpperCase() : 'W'}
        </div>
        <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeWs?.name || 'Workspace'}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 sm:left-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Switch Workspace</p>
            </div>

            <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspaceId;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-300">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left truncate">
                        <p className="truncate font-semibold text-xs">{ws.name}</p>
                        {ws.memberCount && (
                          <p className="text-[10px] text-zinc-500">{ws.memberCount} members</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateWorkspaceClick();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <Plus size={14} />
                Create New Workspace
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onWorkspaceSettingsClick();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                <Settings size={14} />
                Workspace Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
