import React, { useState } from 'react';
import { PromptTemplate } from '../../types';
import { DEFAULT_PROMPT_TEMPLATES } from '../../services/ChatService';
import {
  X,
  Sparkles,
  Mail,
  FileText,
  Megaphone,
  CheckSquare,
  Users,
  Clock,
  Lightbulb,
  Kanban,
  ArrowRight,
} from 'lucide-react';

interface PromptTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (promptText: string, categoryName: string) => void;
}

export const PromptTemplatesModal: React.FC<PromptTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'email', label: 'Sales & Emails' },
    { id: 'proposal', label: 'Proposals' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'notes', label: 'Summaries' },
    { id: 'crm', label: 'CRM & Leads' },
    { id: 'tasks', label: 'Tasks & Planning' },
    { id: 'brainstorm', label: 'Brainstorming' },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? DEFAULT_PROMPT_TEMPLATES
      : DEFAULT_PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return <Mail size={16} className="text-rose-500" />;
      case 'FileText':
        return <FileText size={16} className="text-blue-500" />;
      case 'Megaphone':
        return <Megaphone size={16} className="text-amber-500" />;
      case 'CheckSquare':
        return <CheckSquare size={16} className="text-emerald-500" />;
      case 'Users':
        return <Users size={16} className="text-purple-500" />;
      case 'Clock':
        return <Clock size={16} className="text-indigo-500" />;
      case 'Lightbulb':
        return <Lightbulb size={16} className="text-amber-400" />;
      case 'Kanban':
        return <Kanban size={16} className="text-rose-400" />;
      default:
        return <Sparkles size={16} className="text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-900 dark:text-zinc-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-rose-600 dark:text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Business Prompt Library
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pre-built structured templates for proposals, emails, task generation & CRM strategy.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 shrink-0 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 overflow-y-auto pr-1 flex-1">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl.promptText, tmpl.title);
                onClose();
              }}
              className="group p-4 rounded-2xl bg-zinc-50 hover:bg-rose-50/50 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-500/30 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-white">
                    {getIcon(tmpl.iconName)}
                    <span>{tmpl.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                <span>Use Prompt Template</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
