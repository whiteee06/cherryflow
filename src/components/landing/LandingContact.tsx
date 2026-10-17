import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Globe,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  User,
  Briefcase,
} from 'lucide-react';
import { LandingPageTab } from './LandingHeader';
import { FeedbackService, CONTACT_INFO, FeedbackTicket } from '../../services/FeedbackService';

interface LandingContactProps {
  onTabChange: (tab: LandingPageTab) => void;
  onOpenLiveChat: () => void;
}

export const LandingContact: React.FC<LandingContactProps> = ({
  onTabChange,
  onOpenLiveChat,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'General Feedback',
    message: '',
  });

  const [createdTicket, setCreatedTicket] = useState<FeedbackTicket | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      const ticket = FeedbackService.createTicket({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Contact Form Inquiry',
        category: formData.category,
        message: formData.message,
      });

      setCreatedTicket(ticket);
    }
  };

  return (
    <div className="py-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            We’d Love to Hear From You
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Have questions about CherryFlow, custom workspace plans, or technical support? Contact us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-md space-y-6">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Send Us a Message</h2>

            {createdTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <h3 className="font-bold text-lg">🎉 Thank you for your feedback!</h3>
                </div>
                <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  Your feedback has been successfully submitted. Ticket ID:{' '}
                  <strong className="font-mono text-rose-500">{createdTicket.ticketId}</strong>.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Our team will contact you as soon as possible at {createdTicket.email}.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={FeedbackService.getWhatsAppUrl(createdTicket)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💬 WhatsApp (+91 9952281794)</span>
                  </a>
                  <a
                    href={FeedbackService.getMailtoUrl(createdTicket)}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📧 Email (nithiarasu248@gmail.com)</span>
                  </a>
                  <button
                    onClick={() => {
                      setCreatedTicket(null);
                      setFormData({ name: '', email: '', subject: '', category: 'General Feedback', message: '' });
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nithiarasu G"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nithiarasu248@gmail.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 font-semibold"
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

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your feedback, bug report, or feature request..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Info - Contact Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-500 text-white">
                  <HelpCircle size={20} />
                </div>
                <h3 className="font-extrabold text-xl text-zinc-900 dark:text-white">Need Help?</h3>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Have a question, found a bug, or want to suggest a new feature? Feel free to contact us.
              </p>

              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {/* Founder */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">👤 Founder</span>
                    <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{CONTACT_INFO.name}</p>
                  </div>
                </div>

                {/* Designation */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">💼 Designation</span>
                    <p className="text-sm font-extrabold text-zinc-900 dark:text-white">
                      {CONTACT_INFO.designation} <span className="text-xs text-rose-500">({CONTACT_INFO.company})</span>
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 hover:border-rose-500/50 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">📞 Mobile</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono hover:text-rose-500">
                      {CONTACT_INFO.phone}
                    </p>
                  </div>
                </a>

                {/* WhatsApp Chat */}
                <a
                  href={CONTACT_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                    💬
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">💬 WhatsApp Chat</span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                      {CONTACT_INFO.whatsappPhone}
                    </p>
                  </div>
                </a>

                {/* Email Mailbox */}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500 transition-all cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">📧 Email Mailbox</span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {CONTACT_INFO.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
