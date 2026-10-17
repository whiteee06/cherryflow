import React, { useState, useEffect } from 'react';
import { Note, NoteCategory } from '../../types';
import { X, FileText, Sparkles, Pin, Tag, Clock } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => void;
  note?: Note | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Strategy');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setPinned(note.pinned);
      setTags(note.tags.join(', '));
      setAiSummary(note.aiSummary || '');
    } else {
      setTitle('');
      setContent('');
      setCategory('Strategy');
      setPinned(false);
      setTags('Playbook, Q3');
      setAiSummary('');
    }
    setError('');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      setError('Note content is required to generate AI summary.');
      return;
    }

    setIsSummarizing(true);
    setError('');

    try {
      const res = await fetch('/api/ai/note-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setAiSummary(data.result);
      } else {
        setError('Failed to generate summary.');
      }
    } catch (err: any) {
      setError(`AI Error: ${err.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and note content are required.');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      ...(note ? { id: note.id } : {}),
      title: title.trim(),
      content: content.trim(),
      category,
      pinned,
      tags: tagArray.length > 0 ? tagArray : ['Note'],
      aiSummary: aiSummary || undefined,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {note ? 'Edit Strategy Note' : 'Create Strategy Note'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 Sales Expansion Strategy & Playbook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Strategy">Strategy</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Financials">Financials</option>
                <option value="Product">Product</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="Strategy, Q3, Sales"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Note Body (Markdown supported) *
              </label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} className={isSummarizing ? 'animate-spin' : ''} />
                <span>AI Executive Summary</span>
              </button>
            </div>
            <textarea
              rows={6}
              placeholder="Write your note body, meeting minutes, strategic goals, or team debrief here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {aiSummary && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-xs space-y-1">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} /> Generated Executive Brief
                </span>
                <button
                  type="button"
                  onClick={() => setAiSummary('')}
                  className="text-zinc-400 hover:text-white text-[10px]"
                >
                  Clear
                </button>
              </div>
              <p className="text-zinc-300 leading-relaxed font-sans whitespace-pre-line text-[11px]">
                {aiSummary}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
              />
              <Pin size={14} className={pinned ? 'text-rose-600 fill-rose-600' : ''} />
              <span>Pin this note to Dashboard top</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
            >
              {note ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
