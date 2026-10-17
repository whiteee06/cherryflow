import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { ActivityLog } from '../types';
import { ActivityRow, mapActivityRowToActivity } from '../types/database';
import { parseSupabaseError } from '../lib/errors';
import { loadActivities, saveActivities, addActivityLog } from '../lib/storage';

export class ActivityService {
  /**
   * Fetch activity logs
   */
  static async getActivities(limit = 20): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured) {
      return loadActivities().slice(0, limit);
    }

    try {
      const user = await getCurrentUser();
      if (!user) return loadActivities().slice(0, limit);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error fetching activities from Supabase:', error.message);
        return loadActivities().slice(0, limit);
      }

      const activities = (data as ActivityRow[]).map(mapActivityRowToActivity);
      saveActivities(activities);
      return activities;
    } catch (err) {
      console.warn('ActivityService.getActivities notice (using local storage):', err);
      return loadActivities().slice(0, limit);
    }
  }

  /**
   * Log an activity
   */
  static async logActivity(type: ActivityLog['type'], title: string, description: string): Promise<ActivityLog> {
    const updatedLocalList = addActivityLog(type, title, description);
    const newLocal = updatedLocalList[0];

    if (!isSupabaseConfigured) {
      return newLocal;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return newLocal;

      const { data, error } = await supabase
        .from('activities')
        .insert({
          owner_id: user.id,
          activity_type: type,
          description: `${title}: ${description}`,
        })
        .select()
        .single();

      if (error) {
        console.warn('ActivityService.logActivity notice (using local storage):', error.message || error);
        return newLocal;
      }

      return mapActivityRowToActivity(data as ActivityRow);
    } catch (err: any) {
      console.warn('ActivityService.logActivity warning (using local storage):', err?.message || err);
      return newLocal;
    }
  }
}
