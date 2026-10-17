import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  Calendar,
  UserCheck,
  Tag,
  Clock,
  Plus,
  Send,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Customer, CustomerStatus, CustomerTimelineEvent } from '../../types';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddNote: (customerId: string, noteText: string) => void;
  currencySymbol?: string;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onToggleFavorite,
  onAddNote,
  currencySymbol = '$',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !customer) return null;

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(customer.id, newNote.trim());
    setNewNote('');
  };

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'vip':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            ★ VIP Client
          </span>
        );
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active Client
          </span>
        );
      case 'prospect':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Prospect
          </span>
        );
      case 'lead':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Inbound Lead
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Header Bar */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(customer.id)}
                  title={customer.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    customer.favorite
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <Star size={18} className={customer.favorite ? 'fill-amber-500' : ''} />
                </button>
                {getStatusBadge(customer.status)}
                {customer.archived && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                    Archived
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Client Avatar & Title */}
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${
                  customer.avatarColor || 'bg-rose-600'
                } text-white font-extrabold flex items-center justify-center text-xl shadow-lg shrink-0`}
              >
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{customer.name}</h2>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <Building2 size={13} /> {customer.company || 'Individual Account'}
                </p>
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                  Deal Value: {currencySymbol}{(customer.dealValue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`mailto:${customer.email}`}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-800 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-700/80 transition-all flex items-center justify-center gap-1.5"
              >
                <Mail size={14} /> Email
              </a>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-800 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold border border-zinc-200 dark:border-zinc-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} /> Call
                </a>
              )}
              <button
                onClick={() => onEdit(customer)}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                title="Edit Customer"
              >
                <Edit2 size={15} />
              </button>
              {customer.archived ? (
                <button
                  onClick={() => onRestore(customer.id)}
                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-pointer"
                  title="Restore Customer"
                >
                  <RotateCcw size={15} />
                </button>
              ) : (
                <button
                  onClick={() => onArchive(customer.id)}
                  className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-pointer"
                  title="Archive Customer"
                >
                  <Archive size={15} />
                </button>
              )}
              <button
                onClick={() => onDelete(customer.id)}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 cursor-pointer"
                title="Delete Customer"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 pt-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === 'overview'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Profile & Details
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === 'timeline'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Timeline Log
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 px-4 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === 'notes'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Custom Notes
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Contact Information Group */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Contact Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Mail size={15} className="text-zinc-400 shrink-0" />
                      <span className="font-semibold">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Phone size={15} className="text-zinc-400 shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.website && (
                      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Globe size={15} className="text-zinc-400 shrink-0" />
                        <a
                          href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          {customer.website}
                        </a>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                        <MapPin size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                        <span>{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Metadata */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Business Metadata</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-zinc-400">Industry</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{customer.industry || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Lead Source</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{customer.source || 'Direct'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Assigned Rep</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{customer.assignedUser || 'Owner'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Created Date</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Tags */}
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Tag size={13} /> Tags & Categories
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-500 italic">No tags assigned.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Add Quick Log */}
                <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <MessageSquare size={14} className="text-rose-600" /> Log Interaction Note:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Call held today, discussed Q4 renewal..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Send size={13} /> Log
                    </button>
                  </div>
                </form>

                {/* Timeline Events List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Interaction History</h3>
                  <div className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-4">
                    {customer.timeline && customer.timeline.length > 0 ? (
                      customer.timeline.map((ev) => (
                        <div key={ev.id} className="relative group">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-900" />
                          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/60 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span className="font-semibold text-rose-600 dark:text-rose-400">{ev.title}</span>
                              <span>{new Date(ev.createdAt).toLocaleString()}</span>
                            </div>
                            {ev.description && (
                              <p className="text-xs text-zinc-700 dark:text-zinc-300">{ev.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-zinc-500 italic">
                        Account created on {new Date(customer.createdAt).toLocaleDateString()}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Account Notes</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                    {customer.notes || 'No detailed account notes added yet. Click edit to add custom client notes.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
