import {
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  NotificationType,
} from '../types';
import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';

const NOTIFICATIONS_STORAGE_KEY = 'cherryflow_notifications_v2';
const NOTIF_PREFS_STORAGE_KEY = 'cherryflow_notification_preferences';

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: 'user-primary-owner',
  emailCrm: true,
  emailTasks: true,
  emailBilling: true,
  emailSystem: false,
  inAppCrm: true,
  inAppTasks: true,
  inAppAi: true,
  inAppTeam: true,
  inAppBilling: true,
  pushEnabled: true,
  digestFrequency: 'daily',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export class NotificationService {
  /**
   * Get all notifications
   */
  static async getNotifications(): Promise<AppNotification[]> {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped: AppNotification[] = data.map((n) => ({
              id: n.id,
              workspaceId: n.workspace_id,
              userId: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type as NotificationType,
              category: n.category as NotificationCategory,
              read: n.read,
              metadata: n.metadata,
              actionUrl: n.action_url,
              createdAt: n.created_at,
            }));
            localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mapped));
            return mapped;
          }
        }
      } catch (e) {
        console.error('Supabase fetch notifications error:', e);
      }
    }

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }

  /**
   * Add a notification
   */
  static async addNotification(
    params: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...params,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const current = await this.getNotifications();
    const updated = [newNotif, ...current];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').insert({
          id: newNotif.id,
          user_id: newNotif.userId,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          category: newNotif.category,
          read: false,
          action_url: newNotif.actionUrl,
        });
      } catch (err) {
        console.warn('Supabase insert notification error:', err);
      }
    }

    return newNotif;
  }

  /**
   * Mark as read
   */
  static async markAsRead(id: string): Promise<AppNotification[]> {
    const list = await this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('notifications').update({ read: true }).eq('id', id);
        } catch (e) {
          console.warn('Supabase mark read error:', e);
        }
      }
    }
    return list;
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(): Promise<AppNotification[]> {
    const list = await this.getNotifications();
    list.forEach((n) => (n.read = true));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('read', false);
      } catch (e) {
        console.warn('Supabase mark all read error:', e);
      }
    }
    return list;
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id: string): Promise<AppNotification[]> {
    const list = await this.getNotifications();
    const filtered = list.filter((n) => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notifications').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete notification error:', e);
      }
    }
    return filtered;
  }

  /**
   * Clear all notifications
   */
  static async clearAll(): Promise<AppNotification[]> {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  /**
   * Preferences management
   */
  static async getPreferences(userId: string = 'user-primary-owner'): Promise<NotificationPreferences> {
    const stored = localStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }

    return { ...DEFAULT_PREFERENCES, userId };
  }

  static async savePreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const updated = { ...prefs, updatedAt: new Date().toISOString() };
    localStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notification_preferences').upsert({
          user_id: prefs.userId,
          email_crm: prefs.emailCrm,
          email_tasks: prefs.emailTasks,
          email_billing: prefs.emailBilling,
          email_system: prefs.emailSystem,
          in_app_crm: prefs.inAppCrm,
          in_app_tasks: prefs.inAppTasks,
          in_app_ai: prefs.inAppAi,
          in_app_team: prefs.inAppTeam,
          in_app_billing: prefs.inAppBilling,
          push_enabled: prefs.pushEnabled,
          digest_frequency: prefs.digestFrequency,
        });
      } catch (e) {
        console.warn('Supabase save preferences error:', e);
      }
    }

    return updated;
  }
}
