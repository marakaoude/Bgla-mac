import React, { useState } from 'react';
import { X, Send, Heart, Flame, MessageCircle, Sparkles } from 'lucide-react';
import { TikTokComment } from '../../types';

interface TikTokCommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comments: TikTokComment[];
  videoTitle: string;
  onAddComment: (commentText: string) => void;
}

export const TikTokCommentsDrawer: React.FC<TikTokCommentsDrawerProps> = ({
  isOpen,
  onClose,
  comments,
  videoTitle,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentList, setCommentList] = useState<TikTokComment[]>(comments);

  // Sync if comments prop changes
  React.useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newObj: TikTokComment = {
      id: `c-local-${Date.now()}`,
      userName: 'Fan BGla Mac',
      userHandle: '@fan_bko',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      comment: newComment.trim(),
      timeAgo: 'À l’instant',
      likes: 1,
      isLiked: true,
    };

    setCommentList([newObj, ...commentList]);
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleToggleLike = (id: string) => {
    setCommentList((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  const QUICK_EMOJIS = ['🔥', '🇲🇱', '❤️', '👑', '👏', '⚡', '🎵', '😂'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#161616] border border-[#2b2b2b] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] h-[550px] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between shrink-0 bg-[#121212]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-black text-white font-['Syne',sans-serif]">
              Commentaires ({commentList.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Context Pill */}
        <div className="px-4 py-2 bg-[#1a1a1a] border-b border-[#222] text-[11px] text-zinc-400 truncate">
          Vidéo : <strong className="text-zinc-200">{videoTitle}</strong>
        </div>

        {/* Comments List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 divide-y divide-[#222]">
          {commentList.map((c) => (
            <div key={c.id} className="pt-3 first:pt-0 flex items-start gap-3">
              <img
                src={c.userAvatar}
                alt={c.userName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{c.userName}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{c.userHandle}</span>
                  <span className="text-[10px] text-zinc-500">• {c.timeAgo}</span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words">
                  {c.comment}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(c.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      c.isLiked ? 'text-red-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${c.isLiked ? 'fill-current' : ''}`} />
                    <span>{c.likes}</span>
                  </button>
                  <button type="button" className="hover:text-white transition-colors">
                    Répondre
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 border-t border-[#222] bg-[#121212] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setNewComment((prev) => prev + emoji)}
              className="px-2 py-1 rounded-lg bg-[#1c1c1c] hover:bg-[#282828] text-xs transition-colors shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input Box */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-[#262626] bg-[#141414] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire sympa..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#1f1f1f] border border-[#333] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] disabled:opacity-40 disabled:hover:bg-[#D4AF37] text-black font-bold text-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
