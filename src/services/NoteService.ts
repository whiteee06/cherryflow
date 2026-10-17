import { supabase, isSupabaseConfigured, getCurrentUser } from '../lib/supabase';
import { Note } from '../types';
import { NoteRow, mapNoteRowToNote } from '../types/database';
import { parseSupabaseError } from '../lib/errors';
import { loadNotes, saveNotes, addActivityLog } from '../lib/storage';

export class NoteService {
  /**
   * Fetch user notes with optional search filter
   */
  static async getNotes(filters?: { search?: string; category?: string }): Promise<Note[]> {
    if (!isSupabaseConfigured) {
      let list = loadNotes();
      if (filters?.category && filters.category !== 'All') {
        list = list.filter(n => n.category === filters.category);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        );
      }
      return list;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return loadNotes();

      let query = supabase
        .from('notes')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (filters?.search) {
        const q = `%${filters.search}%`;
        query = query.or(`title.ilike.${q},content.ilike.${q}`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching notes from Supabase:', error.message);
        return loadNotes();
      }

      const notes = (data as NoteRow[]).map(mapNoteRowToNote);
      saveNotes(notes);
      return notes;
    } catch (err) {
      console.error('NoteService.getNotes error:', parseSupabaseError(err));
      return loadNotes();
    }
  }

  /**
   * Fetch single note by ID
   */
  static async getNoteById(id: string): Promise<Note | null> {
    const list = await this.getNotes();
    return list.find(n => n.id === id) || null;
  }

  /**
   * Create a new note
   */
  static async createNote(
    input: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'pinned' | 'tags'>
  ): Promise<Note> {
    const newId = `note_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const localNew: Note = {
      ...input,
      id: newId,
      pinned: false,
      tags: ['Note'],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const currentList = loadNotes();
    const updatedList = [localNew, ...currentList];
    saveNotes(updatedList);
    addActivityLog('note', 'Note Created', `Created note: "${input.title}"`);

    if (!isSupabaseConfigured) {
      return localNew;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return localNew;

      const { data, error } = await supabase
        .from('notes')
        .insert({
          owner_id: user.id,
          title: input.title,
          content: input.content,
        })
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      const created = mapNoteRowToNote(data as NoteRow);
      const refreshedList = updatedList.map(n => (n.id === newId ? created : n));
      saveNotes(refreshedList);
      return created;
    } catch (err) {
      console.error('NoteService.createNote error:', err);
      return localNew;
    }
  }

  /**
   * Update existing note
   */
  static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const currentList = loadNotes();
    const existing = currentList.find(n => n.id === id);
    if (!existing) {
      throw new Error(`Note with ID ${id} not found`);
    }

    const updatedLocal: Note = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const newNotesList = currentList.map(n => (n.id === id ? updatedLocal : n));
    saveNotes(newNotesList);

    if (!isSupabaseConfigured) {
      return updatedLocal;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return updatedLocal;

      const dbUpdates: Partial<NoteRow> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;

      const { data, error } = await supabase
        .from('notes')
        .update(dbUpdates)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      return mapNoteRowToNote(data as NoteRow);
    } catch (err) {
      console.error('NoteService.updateNote error:', err);
      return updatedLocal;
    }
  }

  /**
   * Delete note
   */
  static async deleteNote(id: string): Promise<boolean> {
    const currentList = loadNotes();
    const note = currentList.find(n => n.id === id);
    const updatedList = currentList.filter(n => n.id !== id);
    saveNotes(updatedList);

    if (note) {
      addActivityLog('note', 'Note Deleted', `Deleted note "${note.title}"`);
    }

    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      const user = await getCurrentUser();
      if (!user) return true;

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) {
        throw parseSupabaseError(error);
      }

      return true;
    } catch (err) {
      console.error('NoteService.deleteNote error:', err);
      return true;
    }
  }
}
