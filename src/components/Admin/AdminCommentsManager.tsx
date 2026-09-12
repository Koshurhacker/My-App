import React, { useState, useEffect } from 'react';
import { Trash2, EyeOff, Eye, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { Comment } from '../../types';
import { api } from '../../services/api';

export const AdminCommentsManager: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllComments();
  }, []);

  const loadAllComments = async () => {
    setLoading(true);
    try {
      const data = await api.getAllComments();
      setComments(data);
    } catch (err) {
      console.error('Failed to load all comments for admin', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await api.deleteComment(id);
      setComments(comments.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete comment failed', err);
    }
  };

  const handleToggleHide = async (id: string) => {
    try {
      await api.toggleHideComment(id);
      setComments(
        comments.map((c) => (c.id === id ? { ...c, isHidden: !c.isHidden } : c))
      );
    } catch (err) {
      console.error('Toggle hide failed', err);
    }
  };

  return (
    <div className="bg-[#121318] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Viewer Comments Moderation</h2>
          <p className="text-xs text-neutral-400">Review viewer interactions across all published episodes.</p>
        </div>
        <span className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-white/5">
          {comments.length} total comments
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-400">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-xs">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No comments have been posted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                c.isHidden
                  ? 'bg-neutral-950/60 border-rose-500/20 opacity-60'
                  : 'bg-neutral-900/60 border-white/5'
              }`}
            >
              <div className="flex gap-3 items-start min-w-0">
                <img
                  src={c.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.userName)}`}
                  alt={c.userName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{c.userName}</span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    {c.isHidden && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase">
                        Hidden from viewers
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed break-words">
                    {c.content}
                  </p>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    Episode Ref: {c.episodeId}
                  </span>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleHide(c.id)}
                  className={`p-2 rounded-lg text-xs transition-colors ${
                    c.isHidden
                      ? 'bg-neutral-800 text-neutral-300 hover:text-white'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                  title={c.isHidden ? 'Unhide comment' : 'Hide comment'}
                >
                  {c.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="Delete comment permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
