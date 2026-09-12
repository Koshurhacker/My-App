import React, { useState, useEffect } from 'react';
import { Send, Heart, MessageSquare, Trash2, Shield } from 'lucide-react';
import { Comment, User } from '../types';
import { api } from '../services/api';

interface CommentsSectionProps {
  episodeId: string;
  currentUser: User | null;
  isAdmin?: boolean;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ episodeId, currentUser, isAdmin = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [episodeId]);

  const loadComments = async () => {
    try {
      const data = await api.getComments(episodeId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = currentUser?.name || guestName.trim() || 'Drama Fan';
    setIsSubmitting(true);
    try {
      const created = await api.addComment(
        episodeId,
        currentUser?.id || 'guest-' + Math.random().toString(36).slice(2, 7),
        authorName,
        newComment.trim(),
        currentUser?.avatar
      );
      setComments([created, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        {!currentUser && (
          <input
            type="text"
            placeholder="Your Name (optional)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full mb-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
          />
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="p-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No comments yet. Be the first to share your reaction!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 flex gap-2.5 items-start text-xs"
            >
              <img
                src={comment.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.userName)}`}
                alt={comment.userName}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200 truncate">
                    {comment.userName}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-neutral-300 mt-1 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                  title="Delete Comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
