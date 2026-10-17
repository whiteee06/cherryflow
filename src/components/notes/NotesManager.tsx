import React, { useState } from 'react';
import { Note, NoteCategory } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Tag,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface NotesManagerProps {
  notes: Note[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddModal: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSummarizeNote: (note: Note) => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onSummarizeNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: NoteCategory[] = ['Strategy', 'Client Meeting', 'Financials', 'Product', 'General'];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Knowledge Hub & Strategy Notes</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Store meeting debriefs, financial goals, product specs, and AI executive summaries.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Categories & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Notes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search notes content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Pin size={14} className="fill-rose-500/20" /> Pinned Strategy Documents ({pinnedNotes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
                onSummarize={onSummarizeNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unpinned / Regular Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pt-2">
            Other Notes ({unpinnedNotes.length})
          </h3>
        )}

        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <FileText size={32} className="text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No Notes Found</h3>
            <p className="text-xs text-zinc-500 mt-1">Create your first strategy note or clear search filters.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
                onSummarize={onSummarizeNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSummarize: (n: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onTogglePin, onSummarize }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
            {note.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                note.pinned ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40' : 'text-zinc-400 hover:text-zinc-700'
              }`}
              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin size={14} className={note.pinned ? 'fill-rose-500/30' : ''} />
            </button>
            <button onClick={() => onEdit(note)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(note.id)} className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h4 onClick={() => onEdit(note)} className="text-sm font-bold text-zinc-900 dark:text-white hover:text-rose-600 cursor-pointer mb-2">
          {note.title}
        </h4>

        {note.aiSummary && (
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 mb-3 text-[11px] text-rose-600 dark:text-rose-300">
            <span className="font-semibold flex items-center gap-1 mb-1">
              <Sparkles size={12} /> AI Summary:
            </span>
            <p className="line-clamp-2 text-zinc-600 dark:text-zinc-300">{note.aiSummary}</p>
          </div>
        )}

        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed whitespace-pre-line font-sans">
          {note.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 2).map((tg, i) => (
            <span key={i} className="text-[10px] text-zinc-500">
              #{tg}
            </span>
          ))}
        </div>

        <button
          onClick={() => onSummarize(note)}
          className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
        >
          <Sparkles size={12} /> Summarize
        </button>
      </div>
    </div>
  );
};
