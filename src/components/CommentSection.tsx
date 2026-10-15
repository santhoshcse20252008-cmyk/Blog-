import React, { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, Edit2, Send, CornerDownRight, Check, X } from 'lucide-react';
import { Comment, User } from '../types/blog';
import { api } from '../services/api';

interface CommentSectionProps {
  postId: string;
  currentUser: User | null;
  onRequireAuth: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  currentUser,
  onRequireAuth,
  onCommentsCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Replying state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await api.comments.getCommentsForPost(postId);
      setComments(data);
      if (onCommentsCountChange) {
        // Count total comments including replies
        const total = data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
        onCommentsCountChange(total);
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await api.comments.addComment({
        postId,
        author: currentUser,
        content: newCommentText.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setNewCommentText('');
      if (onCommentsCountChange) {
        onCommentsCountChange(comments.length + 1);
      }
    } catch (err) {
      console.error('Error posting comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!replyText.trim()) return;

    try {
      const newReply = await api.comments.addComment({
        postId,
        parentId,
        author: currentUser,
        content: replyText.trim(),
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      setReplyingToId(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to reply', err);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      await api.comments.updateComment(commentId, editText.trim());
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, content: editText.trim(), updatedAt: new Date().toISOString() };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, content: editText.trim(), updatedAt: new Date().toISOString() }
                  : r
              ),
            };
          }
          return c;
        })
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit comment', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.comments.deleteComment(commentId, postId);
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? c.replies.filter((r) => r.id !== commentId) : [],
          }))
      );
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    try {
      const result = await api.comments.toggleLike(commentId, currentUser.id);
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, likes: result.likes };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) => (r.id === commentId ? { ...r, likes: result.likes } : r)),
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  const formatCommentDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderCommentItem = (item: Comment, isReply = false) => {
    const isOwner = currentUser?.id === item.author.id;
    const isLiked = currentUser ? item.likes?.includes(currentUser.id) : false;
    const isEditing = editingId === item.id;

    return (
      <div
        key={item.id}
        className={`group relative ${isReply ? 'ml-6 sm:ml-10 mt-3 pt-3 border-t border-stone-100' : 'pt-5 first:pt-0'}`}
      >
        <div className="flex items-start gap-3">
          <img
            src={item.author.avatar}
            alt={item.author.name}
            className="w-8 h-8 rounded-full object-cover bg-stone-200 shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0">
            {/* Header: Author & Date */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-stone-900">{item.author.name}</span>
                <span className="text-stone-300 text-xs" aria-hidden="true">·</span>
                <span className="text-[11px] text-stone-400">{formatCommentDate(item.createdAt)}</span>
                {item.updatedAt && (
                  <span className="text-[10px] text-stone-400 italic">(edited)</span>
                )}
              </div>

              {isOwner && !isEditing && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditText(item.content);
                    }}
                    className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Edit comment"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(item.id)}
                    className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Comment Body / Edit View */}
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full text-xs text-stone-800 p-2.5 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 focus:bg-white resize-y"
                  rows={2}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-stone-900 text-white rounded hover:bg-stone-800 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText('');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed break-words whitespace-pre-wrap">
                {item.content}
              </p>
            )}

            {/* Action Bar: Like & Reply */}
            {!isEditing && (
              <div className="flex items-center gap-4 mt-2.5 text-xs text-stone-500">
                <button
                  onClick={() => handleToggleLike(item.id)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer hover:text-rose-600 ${
                    isLiked ? 'text-rose-600 font-medium' : ''
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
                  <span className="font-mono tabular-nums text-[11px]">{item.likes?.length || 0}</span>
                </button>

                {!isReply && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth();
                        return;
                      }
                      setReplyingToId(replyingToId === item.id ? null : item.id);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer text-xs"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            )}

            {/* Inline Reply Input */}
            {replyingToId === item.id && (
              <div className="mt-3 pl-3 border-l-2 border-stone-300">
                <div className="flex items-start gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${item.author.name}...`}
                    className="flex-1 text-xs text-stone-800 p-2.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:border-stone-900 focus:bg-white resize-none"
                    rows={2}
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingToId(null);
                      setReplyText('');
                    }}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddReply(item.id)}
                    disabled={!replyText.trim()}
                    className="px-3 py-1 text-xs font-medium bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            )}

            {/* Render Nested Child Replies */}
            {item.replies && item.replies.length > 0 && (
              <div className="mt-1">
                {item.replies.map((reply) => renderCommentItem(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-stone-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif font-bold text-stone-900">
          Discussion ({comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)})
        </h3>
        <span className="text-xs font-mono text-stone-400">Threaded Interaction</span>
      </div>

      {/* Main Comment Input Form */}
      <form onSubmit={handleAddRootComment} className="mb-8">
        <div className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200 focus-within:border-stone-400 focus-within:bg-white transition-all">
          <img
            src={
              currentUser?.avatar ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=e2e8f0'
            }
            alt={currentUser?.name || 'Guest'}
            className="w-8 h-8 rounded-full object-cover bg-stone-200 shrink-0 mt-1"
          />
          <div className="flex-1">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={
                currentUser
                  ? 'Add your perspective or technical critique...'
                  : 'Sign in to join the discussion...'
              }
              rows={3}
              className="w-full text-sm text-stone-800 placeholder-stone-400 bg-transparent border-0 focus:outline-none resize-none"
              onClick={() => {
                if (!currentUser) onRequireAuth();
              }}
            />
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
              <span className="text-[11px] text-stone-400">Markdown supported</span>
              {currentUser ? (
                <button
                  type="submit"
                  disabled={submitting || !newCommentText.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Posting...' : 'Comment'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors cursor-pointer"
                >
                  Sign in to reply
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400 font-mono">
          Loading discussion threads...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-stone-200 rounded-lg">
          <p className="text-sm font-medium text-stone-700 mb-1">No comments yet</p>
          <p className="text-xs text-stone-500">
            Be the first to share an insight or raise a question on this post.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 space-y-5">
          {comments.map((comment) => renderCommentItem(comment))}
        </div>
      )}
    </section>
  );
};
