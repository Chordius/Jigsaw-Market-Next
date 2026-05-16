import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  local_user_id: string;
  username: string;
}

export default function MarketComments({ marketId }: { marketId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [marketId]);

  const fetchComments = async () => {
    try {
      const { data } = await apiClient.get(`/comments?marketId=${marketId}`);
      if (data.success) {
        setComments(data.payload);
      }
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data } = await apiClient.post('/comments', {
        marketId,
        localUserId: user.id,
        content: newComment.trim(),
      });

      if (data.success) {
        setComments([data.payload, ...comments]);
        setNewComment('');
      } else {
        setError(data.message || 'Failed to post comment');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-outline-variant p-6 rounded flex flex-col gap-6 mt-6">
      <h3 className="font-h3 text-on-surface">Discussion</h3>
      
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="flex flex-col gap-3">
          <textarea
            className="w-full bg-surface-container border border-outline-variant rounded p-3 text-on-surface font-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline-variant resize-none"
            placeholder="Share your thoughts about this market..."
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          {error && <div className="text-error font-body-sm">{error}</div>}
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="self-end bg-primary text-background font-bold px-6 py-2 rounded hover:bg-primary-fixed transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-surface-container-high border border-outline-variant rounded p-4 text-center">
          <p className="text-on-surface-variant font-body-sm mb-2">Login to join the discussion.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-4 mt-4">
        {loading ? (
          <div className="text-center text-outline-variant py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-outline-variant py-8 border border-dashed border-outline-variant rounded">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex flex-col gap-1 border-b border-outline-variant pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface text-body-sm">{comment.username}</span>
                <span className="text-outline text-label-caps">&bull;</span>
                <span className="text-outline font-mono-sm">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-on-surface-variant font-body-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}