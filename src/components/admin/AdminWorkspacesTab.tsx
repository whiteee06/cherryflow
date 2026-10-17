import React, { useState } from 'react';
import {
  Building2,
  Search,
  HardDrive,
  Users,
  Activity,
  AlertTriangle,
  Trash2,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle2,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface PlatformWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  memberCount: number;
  planTier: string;
  status: 'active' | 'suspended';
  storageUsedGb: number;
  aiCreditsUsed: number;
  createdAt: string;
}

interface AdminWorkspacesTabProps {
  workspaces: PlatformWorkspace[];
  onToggleWorkspaceStatus: (workspaceId: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onTransferOwnership: (workspaceId: string, newOwnerEmail: string) => void;
}

export const AdminWorkspacesTab: React.FC<AdminWorkspacesTabProps> = ({
  workspaces,
  onToggleWorkspaceStatus,
  onDeleteWorkspace,
  onTransferOwnership,
}) => {
  const [search, setSearch] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<PlatformWorkspace | null>(null);
  const [transferModal, setTransferModal] = useState<PlatformWorkspace | null>(null);
  const [newOwnerEmailInput, setNewOwnerEmailInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredWorkspaces = workspaces.filter((w) => {
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerEmail.toLowerCase().includes(search.toLowerCase())
    );
  });

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Search Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces by name, slug, or owner email..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Building2 className="w-4 h-4 text-rose-500" />
          <span>Total Isolated Multi-Tenant Workspaces: {workspaces.length}</span>
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Workspace &amp; Slug</th>
                <th className="py-3 px-4">Workspace Owner</th>
                <th className="py-3 px-4">Team Seats</th>
                <th className="py-3 px-4">Storage Used</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredWorkspaces.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">{w.name}</span>
                        <span className="text-zinc-400 font-mono text-[10px]">slug: /{w.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{w.ownerName}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">{w.ownerEmail}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      {w.memberCount} members
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{w.storageUsedGb} GB</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] border border-rose-200 dark:border-rose-900">
                      {w.planTier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {w.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Transfer Ownership */}
                      <button
                        onClick={() => setTransferModal(w)}
                        title="Transfer Workspace Ownership"
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Transfer</span>
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => {
                          onToggleWorkspaceStatus(w.id);
                          triggerNotice(
                            w.status === 'active' ? `Suspended workspace ${w.name}` : `Restored workspace ${w.name}`
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                          w.status === 'active'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {w.status === 'active' ? 'Suspend' : 'Restore'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete workspace ${w.name} and clear all records?`)) {
                            onDeleteWorkspace(w.id);
                            triggerNotice(`Deleted workspace ${w.name}`);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Transfer Ownership: {transferModal.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Current Owner: <span className="font-bold text-zinc-800 dark:text-zinc-200">{transferModal.ownerEmail}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                New Workspace Owner Email *
              </label>
              <input
                type="email"
                required
                value={newOwnerEmailInput}
                onChange={(e) => setNewOwnerEmailInput(e.target.value)}
                placeholder="new.owner@company.com"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTransferModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newOwnerEmailInput) {
                    onTransferOwnership(transferModal.id, newOwnerEmailInput);
                    triggerNotice(`Transferred workspace ${transferModal.name} ownership to ${newOwnerEmailInput}`);
                    setTransferModal(null);
                    setNewOwnerEmailInput('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
