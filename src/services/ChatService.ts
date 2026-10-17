import { supabase } from '../lib/supabase';
import { ChatSession, ChatMessage, AISettings, PromptTemplate, AIUsageLog } from '../types';

const SESSIONS_STORAGE_KEY = 'cherryflow_ai_chat_sessions_v1';
const MESSAGES_STORAGE_KEY = 'cherryflow_ai_chat_messages_v1';
const SETTINGS_STORAGE_KEY = 'cherryflow_ai_settings_v1';

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  model: 'gemini-3.6-flash',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt:
    'You are CherryFlow AI, a top-tier executive business advisor and AI copilot. You help business owners, freelancers, and sales teams draft client communications, formulate growth strategies, organize deliverables, summarize customer interactions, and generate actionable tasks.',
};

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tmpl_email',
    title: 'Draft Client Email',
    category: 'email',
    description: 'Compose high-converting sales outreach, follow-ups, or project updates.',
    promptText:
      'Write a professional, warm, and clear business email to [Client Name / Company] regarding [Topic / Proposal]. Highlight key value propositions, clear next steps, and a polite call to action.',
    iconName: 'Mail',
  },
  {
    id: 'tmpl_proposal',
    title: 'Write Business Proposal',
    category: 'proposal',
    description: 'Outline scope of work, timeline, pricing tiers, and project goals.',
    promptText:
      'Draft a comprehensive business proposal for [Client Name] seeking [Service/Product]. Include Executive Summary, Scope of Work, Deliverables, Estimated Timeline, Pricing Options, and Payment Terms.',
    iconName: 'FileText',
  },
  {
    id: 'tmpl_marketing',
    title: 'Create Marketing Content',
    category: 'marketing',
    description: 'Generate engaging social posts, ad copy, landing page headlines, or newsletters.',
    promptText:
      'Generate 3 creative marketing copy variations for promoting [Product/Service] to target audience [Audience Type]. Include catchy headlines, benefit-driven body copy, and a strong CTA.',
    iconName: 'Megaphone',
  },
  {
    id: 'tmpl_notes_summary',
    title: 'Summarize Meeting Notes',
    category: 'notes',
    description: 'Turn messy notes into structured key takeaways, decisions, and action items.',
    promptText:
      'Please analyze the following raw meeting notes and format them into: 1) Executive Summary, 2) Key Decisions Made, 3) Assigned Action Items with owners and deadlines:\n\n[Paste Notes Here]',
    iconName: 'Sparkles',
  },
  {
    id: 'tmpl_crm_summary',
    title: 'Summarize Customer Profile',
    category: 'crm',
    description: 'Synthesize customer history, deal value, and relationship milestones.',
    promptText:
      'Provide a strategic relationship summary for customer [Customer Name] in industry [Industry]. Recommend 3 personalized engagement touchpoints to increase deal value.',
    iconName: 'Users',
  },
  {
    id: 'tmpl_tasks_from_notes',
    title: 'Generate Tasks from Notes',
    category: 'tasks',
    description: 'Extract concrete, prioritized deliverables directly from meeting text.',
    promptText:
      'Extract a list of actionable tasks from the text below. For each task, specify: Title, Priority (Critical/High/Medium/Low), Estimated Minutes, and Recommended Due Date:\n\n[Paste Text Here]',
    iconName: 'CheckSquare',
  },
  {
    id: 'tmpl_followup',
    title: 'Generate Follow-up Reminders',
    category: 'crm',
    description: 'Create scheduled reminder alerts for pending leads and proposals.',
    promptText:
      'Create a sequence of 3 follow-up reminder messages and recommended schedule (e.g. Day 2, Day 5, Day 10) for a lead who hasn’t responded to our recent proposal on [Topic].',
    iconName: 'Clock',
  },
  {
    id: 'tmpl_brainstorm',
    title: 'Brainstorm Growth Ideas',
    category: 'brainstorm',
    description: 'Generate innovative revenue ideas, marketing channels, and operational improvements.',
    promptText:
      'Brainstorm 5 high-impact growth strategies for a business offering [Service/Product]. Include potential reach, estimated effort, and expected ROI for each idea.',
    iconName: 'Lightbulb',
  },
  {
    id: 'tmpl_project_plan',
    title: 'Draft Project Implementation Plan',
    category: 'project',
    description: 'Build a phase-by-phase roadmap with milestones and risk management.',
    promptText:
      'Develop a step-by-step 4-week project implementation plan for [Project Name]. Breakdown into Phase 1 (Discovery), Phase 2 (Execution), Phase 3 (Review), and Phase 4 (Launch/Handoff).',
    iconName: 'Kanban',
  },
];

export class ChatService {
  // Load Settings
  static getSettings(): AISettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Error reading AI settings:', e);
    }
    return DEFAULT_AI_SETTINGS;
  }

  static saveSettings(settings: AISettings): AISettings {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Error saving AI settings:', e);
    }
    return settings;
  }

  // Local Storage Fallback Helpers
  private static getLocalSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse local chat sessions:', e);
    }

    // Default initial session
    const seed: ChatSession = {
      id: 'sess_default_1',
      title: 'New Conversation',
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: DEFAULT_AI_SETTINGS.systemPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: true,
    };
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([seed]));
    return [seed];
  }

  private static saveLocalSessions(sessions: ChatSession[]) {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }

  private static getLocalMessages(sessionId: string): ChatMessage[] {
    try {
      const stored = localStorage.getItem(`${MESSAGES_STORAGE_KEY}_${sessionId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse local chat messages:', e);
    }

    if (sessionId === 'sess_default_1') {
      const seedMessages: ChatMessage[] = [
        {
          id: 'msg_welcome_1',
          sessionId: 'sess_default_1',
          role: 'assistant',
          content: "Hi! I'm your CherryFlow AI Assistant.\n\nHow can I help your business today?",
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(`${MESSAGES_STORAGE_KEY}_${sessionId}`, JSON.stringify(seedMessages));
      return seedMessages;
    }

    return [];
  }

  private static saveLocalMessages(sessionId: string, messages: ChatMessage[]) {
    localStorage.setItem(`${MESSAGES_STORAGE_KEY}_${sessionId}`, JSON.stringify(messages));
  }

  // CRUD Sessions
  static async getSessions(): Promise<ChatSession[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            provider: d.provider || 'gemini',
            model: d.model || 'gemini-3.6-flash',
            temperature: d.temperature || 0.7,
            maxTokens: d.max_tokens || 2048,
            systemPrompt: d.system_prompt || '',
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            pinned: d.pinned || false,
          }));
        }
      } catch (err) {
        console.warn('Supabase getSessions failed, falling back to local:', err);
      }
    }
    return this.getLocalSessions();
  }

  static async createSession(title = 'New Business Chat', customSettings?: Partial<AISettings>): Promise<ChatSession> {
    const settings = { ...this.getSettings(), ...customSettings };
    const newSession: ChatSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      provider: settings.provider,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      systemPrompt: settings.systemPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            title: newSession.title,
            provider: newSession.provider,
            model: newSession.model,
            temperature: newSession.temperature,
            max_tokens: newSession.maxTokens,
            system_prompt: newSession.systemPrompt,
          })
          .select()
          .single();

        if (!error && data) {
          newSession.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase createSession error:', err);
      }
    }

    const localSessions = this.getLocalSessions();
    this.saveLocalSessions([newSession, ...localSessions]);
    return newSession;
  }

  static async updateSession(id: string, updates: Partial<ChatSession>): Promise<void> {
    if (supabase) {
      try {
        await supabase
          .from('chat_sessions')
          .update({
            title: updates.title,
            provider: updates.provider,
            model: updates.model,
            temperature: updates.temperature,
            max_tokens: updates.maxTokens,
            system_prompt: updates.systemPrompt,
            pinned: updates.pinned,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateSession error:', err);
      }
    }

    const sessions = this.getLocalSessions().map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    this.saveLocalSessions(sessions);
  }

  static async deleteSession(id: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('chat_sessions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSession error:', err);
      }
    }

    const sessions = this.getLocalSessions().filter((s) => s.id !== id);
    this.saveLocalSessions(sessions);
    localStorage.removeItem(`${MESSAGES_STORAGE_KEY}_${id}`);
  }

  // CRUD Messages
  static async getMessages(sessionId: string): Promise<ChatMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            sessionId: d.session_id,
            role: d.role,
            content: d.content,
            tokensUsed: d.tokens_used,
            promptType: d.prompt_type,
            timestamp: d.timestamp,
          }));
        }
      } catch (err) {
        console.warn('Supabase getMessages error:', err);
      }
    }
    return this.getLocalMessages(sessionId);
  }

  static async addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            session_id: newMessage.sessionId,
            role: newMessage.role,
            content: newMessage.content,
            tokens_used: newMessage.tokensUsed || 0,
            prompt_type: newMessage.promptType,
          })
          .select()
          .single();

        if (!error && data) {
          newMessage.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase addMessage error:', err);
      }
    }

    const messages = this.getLocalMessages(newMessage.sessionId);
    this.saveLocalMessages(newMessage.sessionId, [...messages, newMessage]);

    // Update Session timestamp
    await this.updateSession(newMessage.sessionId, { updatedAt: new Date().toISOString() });

    return newMessage;
  }

  static async clearMessages(sessionId: string): Promise<void> {
    if (supabase) {
      try {
        await supabase.from('chat_messages').delete().eq('session_id', sessionId);
      } catch (err) {
        console.warn('Supabase clearMessages error:', err);
      }
    }
    this.saveLocalMessages(sessionId, []);
  }

  // Prompt Templates
  static getTemplates(): PromptTemplate[] {
    return DEFAULT_PROMPT_TEMPLATES;
  }
}
