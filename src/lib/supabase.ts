import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
);

// Fallback placeholder URL to avoid crash on load if env vars are missing
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Server client factory helper for SSR / Server API routes
 */
export function getSupabaseServerClient(customAuthHeader?: string): SupabaseClient {
  return createClient(validUrl, validKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: customAuthHeader ? { Authorization: customAuthHeader } : {},
    },
  });
}

/**
 * Authentication Helpers
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (err: any) {
    return { error: err };
  }
}
