import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FeedbackTicket {
  id: string;
  ticketId: string; // e.g. TICK-92841
  userId?: string;
  name: string;
  email: string;
  subject: string;
  category: 'General Feedback' | 'Bug Report' | 'Feature Request' | 'Billing Issue' | 'Technical Support' | 'Other' | string;
  message: string;
  attachmentUrl?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt?: string;
  replies?: Array<{
    id: string;
    sender: 'user' | 'admin' | 'support';
    authorName: string;
    text: string;
    createdAt: string;
  }>;
}

const FEEDBACK_STORAGE_KEY = 'cherryflow_feedback_tickets';

export const CONTACT_INFO = {
  name: 'Nithiarasu G',
  designation: 'Founder & CEO',
  company: 'CherryFlow Technologies',
  product: 'CherryFlow',
  phone: '+91 9952281794',
  rawPhone: '919952281794',
  whatsappPhone: '+91 9952281794',
  whatsappUrl: 'https://wa.me/919952281794',
  email: 'nithiarasu248@gmail.com',
  country: 'India',
};

export class FeedbackService {
  static getMailtoUrl(ticket: { name: string; email: string; subject: string; category: string; message: string; ticketId?: string }): string {
    const subject = encodeURIComponent(`[CherryFlow Feedback${ticket.ticketId ? ` - ${ticket.ticketId}` : ''}] ${ticket.subject || 'Inquiry'}`);
    const bodyText = `Hello Nithiarasu G,\n\nI am submitting feedback for CherryFlow:\n\n` +
      `Ticket ID: ${ticket.ticketId || 'New'}\n` +
      `Name: ${ticket.name}\n` +
      `Email: ${ticket.email}\n` +
      `Category: ${ticket.category}\n` +
      `Subject: ${ticket.subject}\n\n` +
      `Message:\n${ticket.message}\n\n` +
      `-- Sent via CherryFlow Web App --`;
    return `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  }

  static getWhatsAppUrl(ticket: { name: string; email: string; subject: string; category: string; message: string; ticketId?: string }): string {
    const text = `Hello Nithiarasu G,\n\n` +
      `I am submitting feedback for CherryFlow:\n` +
      `📌 *Ticket ID:* ${ticket.ticketId || 'New'}\n` +
      `👤 *Name:* ${ticket.name}\n` +
      `📧 *Email:* ${ticket.email}\n` +
      `🏷️ *Category:* ${ticket.category}\n` +
      `📝 *Subject:* ${ticket.subject}\n\n` +
      `💬 *Message:*\n${ticket.message}`;
    return `https://wa.me/${CONTACT_INFO.rawPhone}?text=${encodeURIComponent(text)}`;
  }
  static getTickets(): FeedbackTicket[] {
    try {
      const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as FeedbackTicket[];
    } catch (e) {
      console.error('Error loading feedback tickets:', e);
      return [];
    }
  }

  static saveTickets(tickets: FeedbackTicket[]): void {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('Error saving feedback tickets:', e);
    }
  }

  static createTicket(ticketData: {
    userId?: string;
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    attachmentUrl?: string;
  }): FeedbackTicket {
    const tickets = this.getTickets();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `TICK-${randomNum}`;

    const newTicket: FeedbackTicket = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId,
      userId: ticketData.userId || 'usr_guest',
      name: ticketData.name,
      email: ticketData.email,
      subject: ticketData.subject,
      category: ticketData.category,
      message: ticketData.message,
      attachmentUrl: ticketData.attachmentUrl,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const updated = [newTicket, ...tickets];
    this.saveTickets(updated);

    // Async persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { error } = await supabase.from('feedback_tickets').insert({
            id: newTicket.id,
            ticket_id: newTicket.ticketId,
            user_id: newTicket.userId,
            name: newTicket.name,
            email: newTicket.email,
            subject: newTicket.subject,
            category: newTicket.category,
            message: newTicket.message,
            attachment_url: newTicket.attachmentUrl,
            status: newTicket.status,
            created_at: newTicket.createdAt,
            replies: newTicket.replies,
          });
          if (error) {
            console.warn('Supabase feedback insert notice:', error.message);
          }
        } catch (err) {
          console.warn('Supabase feedback sync fallback:', err);
        }
      })();
    }

    return newTicket;
  }

  /**
   * Async helper method to submit feedback, generate unique Ticket ID, and store payload.
   */
  static async submitFeedback(ticketData: {
    userId?: string;
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; ticket: FeedbackTicket; message: string }> {
    const newTicket = this.createTicket(ticketData);
    return {
      success: true,
      ticket: newTicket,
      message: `Feedback submitted successfully! Ticket ID: ${newTicket.ticketId}`,
    };
  }

  static replyToTicket(
    ticketId: string,
    replyText: string,
    authorName: string = 'Super Admin',
    sender: 'admin' | 'user' = 'admin'
  ): FeedbackTicket | null {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId || t.ticketId === ticketId);
    if (index === -1) return null;

    const newReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      sender,
      authorName,
      text: replyText,
      createdAt: new Date().toISOString(),
    };

    const ticket = tickets[index];
    const updatedReplies = [...(ticket.replies || []), newReply];

    // Auto move status to in_progress if open
    const newStatus = ticket.status === 'open' ? 'in_progress' : ticket.status;

    tickets[index] = {
      ...ticket,
      replies: updatedReplies,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.saveTickets(tickets);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('feedback_tickets')
            .update({
              replies: updatedReplies,
              status: newStatus,
              updated_at: tickets[index].updatedAt,
            })
            .eq('id', ticket.id);
        } catch (e) {
          console.warn('Supabase reply update fallback:', e);
        }
      })();
    }

    return tickets[index];
  }

  static updateStatus(ticketId: string, status: FeedbackTicket['status']): FeedbackTicket | null {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId || t.ticketId === ticketId);
    if (index === -1) return null;

    tickets[index] = {
      ...tickets[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.saveTickets(tickets);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from('feedback_tickets')
            .update({
              status,
              updated_at: tickets[index].updatedAt,
            })
            .eq('id', tickets[index].id);
        } catch (e) {
          console.warn('Supabase status update fallback:', e);
        }
      })();
    }

    return tickets[index];
  }

  static deleteTicket(ticketId: string): boolean {
    const tickets = this.getTickets();
    const filtered = tickets.filter((t) => t.id !== ticketId && t.ticketId !== ticketId);
    if (filtered.length === tickets.length) return false;

    this.saveTickets(filtered);

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('feedback_tickets').delete().eq('id', ticketId);
        } catch (e) {
          console.warn('Supabase delete fallback:', e);
        }
      })();
    }

    return true;
  }
}
