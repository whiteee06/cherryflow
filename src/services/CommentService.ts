import { ItemComment, UserPresence } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const COMMENTS_STORAGE_KEY = 'cherryflow_item_comments';
const PRESENCE_STORAGE_KEY = 'cherryflow_user_presences';

const INITIAL_COMMENTS: ItemComment[] = [];

const INITIAL_PRESENCE: UserPresence[] = [];

export class CommentService {
  /**
   * Get comments for a specific item target (task, customer, note)
   */
  static async getComments(targetType: 'task' | 'customer' | 'note', targetId: string): Promise<ItemComment[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`${COMMENTS_STORAGE_KEY}_${targetType}_${targetId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      const filtered = INITIAL_COMMENTS.filter(
        (c) => c.targetType === targetType && c.targetId === targetId
      );
      localStorage.setItem(`${COMMENTS_STORAGE_KEY}_${targetType}_${targetId}`, JSON.stringify(filtered));
      return filtered;
    }

    try {
      const { data, error } = await supabase
        .from('item_comments')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        targetType: row.target_type,
        targetId: row.target_id,
        authorId: row.author_id,
        authorName: row.author_name,
        authorAvatar: row.author_avatar,
        text: row.text,
        mentions: row.mentions || [],
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Add comment to item
   */
  static async addComment(params: {
    targetType: 'task' | 'customer' | 'note';
    targetId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
  }): Promise<ItemComment> {
    // Extract @mentions
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const matches = params.text.match(mentionRegex);
    const mentions = matches ? matches.map((m) => m.replace('@', '')) : [];

    const newComment: ItemComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...params,
      mentions,
      createdAt: new Date().toISOString(),
    };

    const comments = await this.getComments(params.targetType, params.targetId);
    comments.push(newComment);
    localStorage.setItem(
      `${COMMENTS_STORAGE_KEY}_${params.targetType}_${params.targetId}`,
      JSON.stringify(comments)
    );

    if (isSupabaseConfigured) {
      try {
        await supabase.from('item_comments').insert({
          target_type: params.targetType,
          target_id: params.targetId,
          author_id: params.authorId,
          author_name: params.authorName,
          author_avatar: params.authorAvatar,
          text: params.text,
          mentions,
        });
      } catch (err) {
        console.warn('Supabase comment insert error:', err);
      }
    }

    return newComment;
  }

  /**
   * Get active team presences
   */
  static async getOnlinePresence(): Promise<UserPresence[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(PRESENCE_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(INITIAL_PRESENCE));
      return INITIAL_PRESENCE;
    }

    try {
      const { data, error } = await supabase.from('user_presences').select('*');
      if (error || !data || data.length === 0) return INITIAL_PRESENCE;

      return data.map((row: any) => ({
        userId: row.user_id,
        name: row.name,
        email: row.email,
        avatarUrl: row.avatar_url,
        status: row.status,
        activeTab: row.active_tab,
        lastSeenAt: row.last_seen_at,
      }));
    } catch {
      return INITIAL_PRESENCE;
    }
  }

  /**
   * Update active user presence
   */
  static async updateMyPresence(params: {
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string;
    status: 'online' | 'idle' | 'offline';
    activeTab?: string;
  }): Promise<void> {
    const presences = await this.getOnlinePresence();
    const idx = presences.findIndex((p) => p.userId === params.userId);
    const updated: UserPresence = {
      ...params,
      lastSeenAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      presences[idx] = updated;
    } else {
      presences.push(updated);
    }

    localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(presences));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('user_presences').upsert({
          user_id: params.userId,
          name: params.name,
          email: params.email,
          avatar_url: params.avatarUrl,
          status: params.status,
          active_tab: params.activeTab,
          last_seen_at: updated.lastSeenAt,
        });
      } catch (err) {
        console.warn('Supabase presence update error:', err);
      }
    }
  }
}
