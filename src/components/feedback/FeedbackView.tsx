import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  User,
  Briefcase,
  Phone,
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  MessageCircle,
  X,
  FileText,
  Building2,
  Globe,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { FeedbackService, FeedbackTicket, CONTACT_INFO } from '../../services/FeedbackService';
import { UserProfile } from '../../types';

interface FeedbackViewProps {
  currentUser?: UserProfile | null;
  onBackToDashboard?: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ currentUser, onBackToDashboard }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    subject: '',
    category: 'General Feedback',
    message: '',
    attachmentName: '',
    attachmentUrl: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState<FeedbackTicket | null>(null);
  const [myTickets, setMyTickets] = useState<FeedbackTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);
  const [userReplyText, setUserReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
  const [sendToMailbox, setSendToMailbox] = useState(true);

  useEffect(() => {
    loadUserTickets();
  }, [currentUser]);

  const loadUserTickets = () => {
    const all = FeedbackService.getTickets();
    if (currentUser?.email) {
      const userTickets = all.filter((t) => t.email.toLowerCase() === currentUser.email.toLowerCase() || t.userId === currentUser.id);
      setMyTickets(userTickets);
    } else {
      setMyTickets(all.slice(0, 5));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: mockUrl,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const created = FeedbackService.createTicket({
        userId: currentUser?.id,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
        attachmentUrl: formData.attachmentName ? `attachment://${formData.attachmentName}` : undefined,
      });

      setSubmittedTicket(created);
      setIsSubmitting(false);

      // Trigger instant dispatch options if selected
      if (sendToWhatsApp) {
        const waUrl = FeedbackService.getWhatsAppUrl(created);
        window.open(waUrl, '_blank');
      }

      if (sendToMailbox) {
        const mailUrl = FeedbackService.getMailtoUrl(created);
        setTimeout(() => {
          window.location.href = mailUrl;
        }, sendToWhatsApp ? 600 : 0);
      }

      // Reset form
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        subject: '',
        category: 'General Feedback',
        message: '',
        attachmentName: '',
        attachmentUrl: '',
      });

      loadUserTickets();
    }, 600);
  };

  const handleUserReply = (ticketId: string) => {
    if (!userReplyText.trim()) return;
    const updated = FeedbackService.replyToTicket(
      ticketId,
      userReplyText,
      currentUser?.name || 'Customer',
      'user'
    );
    if (updated) {
      setSelectedTicket(updated);
      setUserReplyText('');
      loadUserTickets();
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <MessageSquare size={18} />
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              Support &amp; Feedback Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            We’d Love to Hear From You
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 max-w-2xl">
            Have a question, found a bug, or want to suggest a new feature? Send us a ticket or reach out directly to our leadership team.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-all cursor-pointer self-start md:self-auto"
          >
            &larr; Back to Dashboard
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
            {/* Glassmorphism ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Need Help?</h2>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              Have a question, found a bug, or want to suggest a new feature? Feel free to contact us.
            </p>

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
              {/* Founder */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">👤 Founder</span>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{CONTACT_INFO.name}</p>
                </div>
              </div>

              {/* Designation */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <Briefcase size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">💼 Designation</span>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    {CONTACT_INFO.designation} <span className="text-xs text-rose-500 font-semibold">({CONTACT_INFO.company})</span>
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 hover:border-rose-500/50 transition-all group/item"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold group-hover/item:bg-rose-500 group-hover/item:text-white transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">📞 Mobile</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono group-hover/item:text-rose-500 transition-colors">
                    {CONTACT_INFO.phone}
                  </p>
                </div>
              </a>

              {/* WhatsApp Chat */}
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 transition-all group/item cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover/item:scale-105 transition-transform">
                  <MessageCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">💬 WhatsApp Chat</span>
                    <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">Instant</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono group-hover/item:text-emerald-500 transition-colors">
                    {CONTACT_INFO.whatsappPhone}
                  </p>
                </div>
              </a>

              {/* Email Mailbox */}
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 hover:border-rose-500 transition-all group/item cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 group-hover/item:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">📧 Email Mailbox</span>
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">Direct</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover/item:text-rose-500 transition-colors">
                    {CONTACT_INFO.email}
                  </p>
                </div>
              </a>

              {/* Country */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <Globe size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🌐 Location</span>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{CONTACT_INFO.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User's Previous Tickets Summary */}
          {myTickets.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock size={16} className="text-rose-500" /> My Submitted Feedback ({myTickets.length})
                </h3>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {myTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-rose-500">{t.ticketId}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold truncate">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">{t.subject}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                        t.status === 'open'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                          : t.status === 'in_progress'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Form */}
        <div className="lg:col-span-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 relative">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <FileText size={22} />
              </span>
              Submit Your Feedback
            </h2>

            {/* Success Message Banner after submission */}
            {submittedTicket ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-500/10 via-emerald-500/5 to-transparent border border-rose-500/30 text-zinc-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest block">
                      Ticket ID: {submittedTicket.ticketId}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                      🎉 Thank you for your feedback!
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white/60 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="font-semibold text-rose-600 dark:text-rose-400">
                    Your feedback has been successfully submitted.
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Our team will contact you as soon as possible at <strong className="text-zinc-900 dark:text-white">{submittedTicket.email}</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={FeedbackService.getWhatsAppUrl(submittedTicket)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>Send via WhatsApp (+91 9952281794)</span>
                  </a>
                  <a
                    href={FeedbackService.getMailtoUrl(submittedTicket)}
                    className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-md shadow-rose-500/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>Send to Mailbox (nithiarasu248@gmail.com)</span>
                  </a>
                  <button
                    onClick={() => setSubmittedTicket(null)}
                    className="px-5 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Submit Another Response
                  </button>
                  <button
                    onClick={() => setSelectedTicket(submittedTicket)}
                    className="px-5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
                  >
                    View Ticket Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Nithiarasu G"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. nithiarasu248@gmail.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of your feedback or inquiry"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-white font-semibold transition-all"
                    >
                      <option value="General Feedback">General Feedback</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Billing Issue">Billing Issue</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query, suggestion, or issue..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-rose-500 text-zinc-900 dark:text-white transition-all resize-y"
                  />
                </div>

                {/* Attachment (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Attachment (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center gap-2 transition-all">
                      <Paperclip size={16} className="text-rose-500" />
                      <span>{formData.attachmentName ? 'Change File' : 'Choose File'}</span>
                      <input type="file" onChange={handleFileChange} className="hidden" />
                    </label>
                    {formData.attachmentName && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> {formData.attachmentName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dispatch Channels Options */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                    ⚡ Send &amp; Receive via Direct Channels:
                  </span>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={sendToWhatsApp}
                        onChange={(e) => setSendToWhatsApp(e.target.checked)}
                        className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} className="text-emerald-500" /> Direct WhatsApp (+91 9952281794)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={sendToMailbox}
                        onChange={(e) => setSendToMailbox(e.target.checked)}
                        className="rounded border-zinc-300 text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <Mail size={14} className="text-rose-500" /> Direct Mailbox (nithiarasu248@gmail.com)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Feedback...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-500 block">{selectedTicket.ticketId}</span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <div>
                  <strong className="text-zinc-900 dark:text-white">Category:</strong> {selectedTicket.category}
                </div>
                <div>
                  <strong className="text-zinc-900 dark:text-white">Status:</strong> {selectedTicket.status}
                </div>
                <div>
                  <strong className="text-zinc-900 dark:text-white">Date:</strong>{' '}
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {selectedTicket.message}
              </div>

              {/* Replies History */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Response Thread</h4>
                  {selectedTicket.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        rep.sender === 'admin'
                          ? 'bg-rose-500/10 border border-rose-500/20 text-zinc-900 dark:text-white ml-4'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px]">
                        <span className={rep.sender === 'admin' ? 'text-rose-500' : 'text-zinc-500'}>
                          {rep.authorName} ({rep.sender === 'admin' ? 'Super Admin' : 'You'})
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p>{rep.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* User Reply Input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userReplyText}
                    onChange={(e) => setUserReplyText(e.target.value)}
                    placeholder="Type a follow-up reply..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => handleUserReply(selectedTicket.id)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Send size={14} /> Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
