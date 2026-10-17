import React from 'react';
import { UserPresence } from '../../types';
import { Users, Wifi, Circle } from 'lucide-react';

interface TeamPresenceBarProps {
  presences: UserPresence[];
}

export const TeamPresenceBar: React.FC<TeamPresenceBarProps> = ({ presences }) => {
  const onlineUsers = presences.filter((p) => p.status === 'online');
  const idleUsers = presences.filter((p) => p.status === 'idle');

  return (
    <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Wifi size={14} className="animate-pulse" />
          <span>Realtime Team Presence</span>
        </div>
        <p className="text-xs text-zinc-400 hidden md:block">
          {onlineUsers.length} active online · {idleUsers.length} idle
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {presences.map((p) => (
          <div
            key={p.userId}
            title={`${p.name} (${p.status.toUpperCase()}) - Viewing ${p.activeTab || 'Dashboard'}`}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/80 shrink-0 text-xs"
          >
            <div className="relative">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.name} className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {p.name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-900 ${
                  p.status === 'online'
                    ? 'bg-emerald-500'
                    : p.status === 'idle'
                    ? 'bg-amber-500'
                    : 'bg-zinc-500'
                }`}
              />
            </div>

            <div className="text-left">
              <p className="text-[11px] font-bold text-zinc-200 leading-tight">{p.name.split(' ')[0]}</p>
              {p.activeTab && (
                <p className="text-[9px] text-rose-400 font-semibold capitalize">{p.activeTab}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
