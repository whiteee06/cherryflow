import { Workspace, WorkspaceMember, WorkspaceRole } from '../types';
import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { ActivityService } from './ActivityService';

const WORKSPACES_STORAGE_KEY = 'cherryflow_workspaces';
const ACTIVE_WORKSPACE_KEY = 'cherryflow_active_workspace_id';

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-primary-default',
    name: 'My Workspace',
    slug: 'my-workspace',
    ownerId: 'user-primary-owner',
    description: 'Primary workspace for customer management, tasks, and business operations.',
    memberCount: 1,
    createdAt: new Date().toISOString(),
  },
];

export class WorkspaceService {
  /**
   * Get all workspaces available to the current user
   */
  static async getWorkspaces(): Promise<Workspace[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(WORKSPACES_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(INITIAL_WORKSPACES));
      return INITIAL_WORKSPACES;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return INITIAL_WORKSPACES;

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_WORKSPACES;
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
        ownerId: row.owner_id,
        logoUrl: row.logo_url,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return INITIAL_WORKSPACES;
    }
  }

  /**
   * Get current active workspace ID or set default
   */
  static getActiveWorkspaceId(): string {
    const activeId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    return activeId || INITIAL_WORKSPACES[0].id;
  }

  /**
   * Set active workspace ID
   */
  static setActiveWorkspaceId(workspaceId: string): void {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
  }

  /**
   * Create a new workspace
   */
  static async createWorkspace(params: {
    name: string;
    description?: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
  }): Promise<Workspace> {
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newWs: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: params.name,
      slug,
      ownerId: params.ownerId,
      description: params.description || '',
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .insert({
            name: params.name,
            slug,
            owner_id: params.ownerId,
            description: params.description || '',
          })
          .select()
          .single();

        if (data) {
          newWs.id = data.id;
          // Add owner to members table
          await supabase.from('workspace_members').insert({
            workspace_id: data.id,
            user_id: params.ownerId,
            name: params.ownerName,
            email: params.ownerEmail,
            role: 'owner',
            status: 'active',
          });
        }
      } catch (err) {
        console.warn('Supabase workspace creation fallback:', err);
      }
    }

    // Local storage fallback sync
    const workspaces = await this.getWorkspaces();
    workspaces.unshift(newWs);
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
    this.setActiveWorkspaceId(newWs.id);

    ActivityService.logActivity(
      'system',
      'Created Workspace',
      `Created new team workspace "${params.name}"`
    );

    return newWs;
  }

  /**
   * Update existing workspace
   */
  static async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace | null> {
    const workspaces = await this.getWorkspaces();
    const index = workspaces.findIndex((w) => w.id === id);
    if (index === -1) return null;

    const updated = { ...workspaces[index], ...updates, updatedAt: new Date().toISOString() };
    workspaces[index] = updated;

    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('workspaces')
          .update({
            name: updated.name,
            description: updated.description,
            logo_url: updated.logoUrl,
            updated_at: updated.updatedAt,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase workspace update fallback:', err);
      }
    }

    return updated;
  }

  /**
   * Delete workspace
   */
  static async deleteWorkspace(id: string): Promise<boolean> {
    let workspaces = await this.getWorkspaces();
    workspaces = workspaces.filter((w) => w.id !== id);
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));

    if (this.getActiveWorkspaceId() === id && workspaces.length > 0) {
      this.setActiveWorkspaceId(workspaces[0].id);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('workspaces').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase workspace delete error:', err);
      }
    }

    return true;
  }
}
