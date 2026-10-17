import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Plus,
  X,
  Trash2,
  Tag,
  Building2,
} from 'lucide-react';
import { SupportTicket } from '../../types/admin';
import { FeedbackService, FeedbackTicket } from '../../services/FeedbackService';

interface AdminSupportCenterTabProps {
  tickets: SupportTicket[];
  onReplyTicket: (ticketId: string, replyText: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  onAssignStaff: (ticketId: string, staffName: string) => void;
  onAddInternalNote: (ticketId: string, note: string) => void;
}

export const AdminSupportCenterTab: React.FC<AdminSupportCenterTabProps> = ({
  tickets,
  onReplyTicket,
  onUpdateTicketStatus,
  onAssignStaff,
  onAddInternalNote,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const [replyInput, setReplyInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbackTickets();
  }, []);

  const loadFeedbackTickets = () => {
    setFeedbackTickets(FeedbackService.getTickets());
  };

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Combine prop tickets and feedback tickets
  const normalizedFeedbackTickets = feedbackTickets.map((fb) => ({
    id: fb.id,
    ticketNumber: fb.ticketId,
    workspaceId: 'ws_feedback',
    workspaceName: 'Direct Feedback',
    userId: fb.userId || 'usr_guest',
    userName: fb.name,
    userEmail: fb.email,
    subject: fb.subject,
    category: fb.category,
    priority: 'medium' as const,
    status: fb.status,
    assignedStaff: 'Unassigned',
    messages: [
      {
        id: `msg_orig_${fb.id}`,
        sender: 'user' as const,
        authorName: fb.name,
        authorEmail: fb.email,
        text: fb.message,
        createdAt: fb.createdAt,
      },
      ...(fb.replies || []).map((r) => ({
        id: r.id,
        sender: r.sender === 'user' ? ('user' as const) : ('support' as const),
        authorName: r.authorName,
        text: r.text,
        createdAt: r.createdAt,
      })),
    ],
    internalNotes: fb.attachmentUrl ? [`Attachment: ${fb.attachmentUrl}`] : [],
    createdAt: fb.createdAt,
    updatedAt: fb.updatedAt || fb.createdAt,
    isFeedbackService: true,
  }));

  const allCombinedTickets = [
    ...normalizedFeedbackTickets,
    ...tickets.map((t) => ({ ...t, isFeedbackService: false })),
  ];

  const filteredTickets = allCombinedTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (ticketId: string, isFeedbackService: boolean) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      if (isFeedbackService) {
        FeedbackService.deleteTicket(ticketId);
        loadFeedbackTickets();
      }
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      triggerNotice('Ticket deleted successfully');
    }
  };

  const handleReply = (ticketId: string, replyText: string, isFeedbackService: boolean) => {
    if (!replyText.trim()) return;
    if (isFeedbackService) {
      FeedbackService.replyToTicket(ticketId, replyText, 'Super Admin', 'admin');
      loadFeedbackTickets();
    } else {
      onReplyTicket(ticketId, replyText);
    }
    triggerNotice('Reply sent successfully');
    setReplyInput('');
    setSelectedTicket(null);
  };

  const handleStatusChange = (ticketId: string, status: any, isFeedbackService: boolean) => {
    if (isFeedbackService) {
      FeedbackService.updateStatus(ticketId, status);
      loadFeedbackTickets();
    } else {
      onUpdateTicketStatus(ticketId, status);
    }
    triggerNotice(`Status updated to ${status.toUpperCase()}`);
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ticket #, subject, email, or name..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Categories</option>
            <option value="General Feedback">General Feedback</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Billing Issue">Billing Issue</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-rose-500" />
            Support &amp; Feedback Submissions ({filteredTickets.length} Tickets)
          </h3>
          <span className="text-xs text-zinc-400">Response SLA: &lt; 2 Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
            <thead className="bg-zinc-100 dark:bg-zinc-950 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Customer &amp; Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No tickets found matching your query or filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-500">{t.ticketNumber}</td>

                    <td className="py-3.5 px-4 max-w-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {t.subject}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold block text-zinc-900 dark:text-white">{t.userName}</span>
                      <span className="text-zinc-400 text-[11px]">{t.userEmail}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          t.status === 'open'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            : t.status === 'in_progress'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            : t.status === 'resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
                        >
                          View &amp; Reply
                        </button>

                        <button
                          onClick={() => handleDelete(t.id, t.isFeedbackService)}
                          title="Delete Ticket"
                          className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 cursor-pointer transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-rose-500">{selectedTicket.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">{selectedTicket.subject}</h3>
                <p className="text-xs text-zinc-400">
                  {selectedTicket.userName} ({selectedTicket.userEmail})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedTicket.id, (selectedTicket as any).isFeedbackService)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {m.authorName} ({m.sender === 'user' ? 'Customer' : 'Support Team'})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}

              {/* Internal Notes or Attachments */}
              {selectedTicket.internalNotes && selectedTicket.internalNotes.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                    Internal Notes / Attachments
                  </span>
                  {selectedTicket.internalNotes.map((note, idx) => (
                    <p key={idx} className="text-amber-900 dark:text-amber-300 italic">
                      • {note}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Reply Composer */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-500">Change Ticket Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedTicket.id,
                        'open',
                        (selectedTicket as any).isFeedbackService
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedTicket.status === 'open'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedTicket.id,
                        'in_progress',
                        (selectedTicket as any).isFeedbackService
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedTicket.status === 'in_progress'
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedTicket.id,
                        'resolved',
                        (selectedTicket as any).isFeedbackService
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedTicket.id,
                        'closed',
                        (selectedTicket as any).isFeedbackService
                      )
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedTicket.status === 'closed'
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                    }`}
                  >
                    Close Ticket
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Type official support reply to send to the customer..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleReply(
                      selectedTicket.id,
                      replyInput,
                      (selectedTicket as any).isFeedbackService
                    )
                  }
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
