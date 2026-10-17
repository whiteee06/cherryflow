import React, { useState, useEffect } from 'react';
import { Customer, Task, Note, ViewTab } from '../../types';
import { Search, Building2, CheckSquare, FileText, X, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  tasks: Task[];
  notes: Note[];
  onNavigateTab: (tab: ViewTab) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTask?: (task: Task) => void;
  onSelectNote?: (note: Note) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  tasks,
  notes,
  onNavigateTab,
  onSelectCustomer,
  onSelectTask,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const matchedCustomers = cleanQuery
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.company.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery)
      )
    : customers.slice(0, 3);

  const matchedTasks = cleanQuery
    ? tasks.filter((t) => t.title.toLowerCase().includes(cleanQuery) || t.description.toLowerCase().includes(cleanQuery))
    : tasks.slice(0, 3);

  const matchedNotes = cleanQuery
    ? notes.filter((n) => n.title.toLowerCase().includes(cleanQuery) || n.content.toLowerCase().includes(cleanQuery))
    : notes.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950">
          <Search size={20} className="text-rose-500" />
          <input
            type="text"
            autoFocus
            placeholder="Search across customers, tasks, or strategy notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-5">
          {/* Customers section */}
          {matchedCustomers.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Customers ({matchedCustomers.length})</span>
                <button
                  onClick={() => {
                    onNavigateTab('customers');
                    onClose();
                  }}
                  className="hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </p>
              <div className="space-y-1.5">
                {matchedCustomers.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCustomer) onSelectCustomer(c);
                      onNavigateTab('customers');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{c.name}</p>
                        <p className="text-[10px] text-zinc-500">{c.company} • {c.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks section */}
          {matchedTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Tasks ({matchedTasks.length})</span>
                <button
                  onClick={() => {
                    onNavigateTab('tasks');
                    onClose();
                  }}
                  className="hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </p>
              <div className="space-y-1.5">
                {matchedTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (onSelectTask) onSelectTask(t);
                      onNavigateTab('tasks');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <CheckSquare size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{t.title}</p>
                        <p className="text-[10px] text-zinc-500">Priority: {t.priority} • Due: {t.dueDate || 'No due date'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes section */}
          {matchedNotes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Strategy Notes ({matchedNotes.length})</span>
                <button
                  onClick={() => {
                    onNavigateTab('notes');
                    onClose();
                  }}
                  className="hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight size={12} />
                </button>
              </p>
              <div className="space-y-1.5">
                {matchedNotes.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (onSelectNote) onSelectNote(n);
                      onNavigateTab('notes');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <FileText size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{n.title}</p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{n.content}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {n.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
