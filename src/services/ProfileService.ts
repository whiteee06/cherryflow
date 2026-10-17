import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { UserProfile } from '../types';
import {
  ProfileRow,
  mapProfileRowToUserProfile,
} from '../types/database';
import { parseSupabaseError } from '../lib/errors';
import { loadUserProfile, saveUserProfile } from '../lib/storage';

export class ProfileService {
  /**
   * Fetch current user's profile
   */
  static async getProfile(): Promise<UserProfile> {
    if (!isSupabaseConfigured) {
      return loadUserProfile();
    }

    try {
      const user = await getCurrentUser();
      if (!user) return loadUserProfile();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Profile not found in Supabase, falling back to local state:', error.message);
        return loadUserProfile();
      }

      const profile = mapProfileRowToUserProfile(data as ProfileRow);
      saveUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error in ProfileService.getProfile:', parseSupabaseError(err));
      return loadUserProfile();
    }
  }

  /**
   * Update profile details
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentLocal = loadUserProfile();
    const updatedLocal: UserProfile = { ...currentLocal, ...updates };
    saveUserProfile(updatedLocal);

    if (!isSupabaseConfigured) {
      return updatedLocal;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return updatedLocal;

      const dbUpdates: Partial<ProfileRow> = {};
      if (updates.name !== undefined) dbUpdates.full_name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.businessName !== undefined) dbUpdates.company_name = updates.businessName;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      const updated = mapProfileRowToUserProfile(data as ProfileRow);
      saveUserProfile(updated);
      return updated;
    } catch (err) {
      console.error('Error in ProfileService.updateProfile:', err);
      return updatedLocal;
    }
  }

  /**
   * Upload user avatar image to Supabase Storage bucket 'avatars'
   */
  static async uploadAvatar(file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      // Create local object URL preview for non-configured env
      const objectUrl = URL.createObjectURL(file);
      await this.updateProfile({ avatarUrl: objectUrl });
      return objectUrl;
    }

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('User must be authenticated to upload avatar');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw parseSupabaseError(uploadError);
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      await this.updateProfile({ avatarUrl: publicUrl });
      return publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      // Fallback
      const objectUrl = URL.createObjectURL(file);
      await this.updateProfile({ avatarUrl: objectUrl });
      return objectUrl;
    }
  }
}
