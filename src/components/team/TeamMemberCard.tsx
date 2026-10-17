import React, { useState } from 'react';
import { WorkspaceMember, WorkspaceRole } from '../../types';
import { Shield, MoreVertical, Trash2, Mail, Check, UserCheck, AlertCircle } from 'lucide-react';

interface TeamMemberCardProps {
  member: WorkspaceMember;
  currentUserRole: WorkspaceRole;
  currentUserId: string;
  onRoleChange: (memberId: string, newRole: WorkspaceRole) => void;
  onRemoveMember: (memberId: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onRemoveMember,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canManage =
    (currentUserRole === 'owner' || currentUserRole === 'admin') &&
    member.userId !== currentUserId &&
    member.role !== 'owner';

  const roleColors: Record<WorkspaceRole, string> = {
    owner: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    manager: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    employee: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    member: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    viewer: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
            </div>
          )}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
              member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{member.name}</h4>
            {member.userId === currentUserId && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                You
              </span>
            )}
            {member.mustChangePassword && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                Pending 1st Login
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
            <Mail size={12} />
            {member.email}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
        <span
          className={`px-3 py-1 rounded-xl text-xs font-bold border capitalize flex items-center gap-1.5 ${
            roleColors[member.role] || roleColors.member
          }`}
        >
          <Shield size={12} />
          {member.role}
        </span>

        {canManage && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase">Change Role</p>
                  {(['admin', 'member', 'viewer'] as WorkspaceRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(member.id, r);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs capitalize cursor-pointer ${
                        member.role === r
                          ? 'text-rose-400 font-bold bg-rose-500/10'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{r}</span>
                      {member.role === r && <Check size={12} />}
                    </button>
                  ))}

                  <div className="my-1 border-t border-zinc-800" />

                  <button
                    onClick={() => {
                      onRemoveMember(member.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Remove Member
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
