import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, Edit2, Trash2, Reply, X, Check } from "lucide-react";
import { commentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../socket";
import toast from "react-hot-toast";

export default function CommentSection({ ticketId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCommentAdded = (comment) => {
      if (comment.ticketId === ticketId) {
        setComments((prev) => [comment, ...prev]);
      }
    };

    socket.on("commentAdded", handleCommentAdded);
    return () => socket.off("commentAdded", handleCommentAdded);
  }, [ticketId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.list(ticketId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const payload = {
        content: newComment.trim(),
        ticketId,
        parentId: replyingTo || null,
      };
      const response = await commentAPI.create(payload);
      setComments((prev) => [response.data.comment, ...prev]);
      setNewComment("");
      setReplyingTo(null);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const response = await commentAPI.update(commentId, {
        content: editContent.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? response.data.comment : c)),
      );
      setEditingId(null);
      setEditContent("");
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await commentAPI.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-slate-400">Loading comments...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="bg-white/[0.04] border border-white/10 rounded-lg p-4">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 text-sm text-indigo-400">
            <span>Replying to comment...</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            rows="2"
            className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="self-end px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          <p>No comments yet</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white/[0.02] border border-white/5 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {comment.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">
                    {comment.user?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <div className="mt-2 flex gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white"
                    />
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="px-3 py-1 bg-slate-600 text-white rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm mt-1">
                    {comment.content}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-slate-400 hover:text-indigo-400"
                  >
                    Reply
                  </button>
                  {comment.userId === user?.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-xs text-slate-400 hover:text-blue-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-slate-400 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
