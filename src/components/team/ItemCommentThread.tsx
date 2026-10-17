import React, { useState, useEffect } from 'react';
import { ItemComment } from '../../types';
import { CommentService } from '../../services/CommentService';
import { MessageSquare, Send, AtSign, User, CornerDownRight, Sparkles } from 'lucide-react';

interface ItemCommentThreadProps {
  targetType: 'task' | 'customer' | 'note';
  targetId: string;
  currentUser: { id: string; name: string; avatarUrl?: string };
  teamMembers?: { name: string; email: string }[];
}

export const ItemCommentThread: React.FC<ItemCommentThreadProps> = ({
  targetType,
  targetId,
  currentUser,
  teamMembers = [],
}) => {
  const [comments, setComments] = useState<ItemComment[]>([]);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);

  const loadComments = async () => {
    const data = await CommentService.getComments(targetType, targetId);
    setComments(data);
  };

  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await CommentService.addComment({
        targetType,
        targetId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatarUrl,
        text: text.trim(),
      });

      setText('');
      setShowMentionMenu(false);
      loadComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMention = (memberName: string) => {
    const handleName = memberName.toLowerCase().replace(/\s+/g, '.');
    setText((prev) => `${prev} @${handleName} `);
    setShowMentionMenu(false);
  };

  return (
    <div className="space-y-4 pt-3">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-rose-500" />
          Team Comment Discussion ({comments.length})
        </h4>

        {teamMembers.length > 0 && (
          <button
            type="button"
            onClick={() => setShowMentionMenu(!showMentionMenu)}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
          >
            <AtSign size={12} /> Mention Colleague
          </button>
        )}
      </div>

      {/* Mention helper menu */}
      {showMentionMenu && (
        <div className="p-2 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-xl space-y-1 animate-in fade-in">
          <p className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase">Select Member to Mention</p>
          <div className="flex flex-wrap gap-1.5">
            {teamMembers.map((m) => (
              <button
                key={m.email}
                type="button"
                onClick={() => insertMention(m.name)}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-rose-600 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
              >
                @{m.name.toLowerCase().replace(/\s+/g, '.')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments Feed */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {comment.authorAvatar ? (
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {comment.authorName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{comment.authorName}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-8">
              {comment.text}
            </p>

            {comment.mentions && comment.mentions.length > 0 && (
              <div className="pl-8 flex items-center gap-1">
                <span className="text-[10px] text-purple-500 font-bold">Mentions:</span>
                {comment.mentions.map((m) => (
                  <span
                    key={m}
                    className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold"
                  >
                    @{m}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-zinc-500 italic py-3 text-center">
            No team comments yet. Start the conversation!
          </p>
        )}
      </div>

      {/* Reply input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment or mention @colleague..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
