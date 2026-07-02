import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  User,
  Calendar,
  AlertCircle,
  Save,
  X,
  MessageCircle,
  Paperclip,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ticketAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "../../components/ticket/CommentSection";
import AttachmentUpload from "../../components/ticket/AttachmentUpload";
import ActivityTimeline from "../../components/ticket/ActivityTimeline";
import toast from "react-hot-toast";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.detail(id);
      setTicket(response.data.ticket);
      setFormData(response.data.ticket);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast.error("Failed to load ticket");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      setFormData(ticket);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await ticketAPI.update(id, formData);
      setTicket(response.data.ticket);
      setFormData(response.data.ticket);
      setEditing(false);
      toast.success("Ticket updated successfully! ✅");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update ticket");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await ticketAPI.remove(id);
      toast.success("Ticket deleted");
      navigate("/tickets");
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await ticketAPI.updateStatus(id, newStatus);
      setTicket(response.data.ticket);
      toast.success(`Ticket moved to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
      HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      LOW: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[priority] || "bg-white/10 text-slate-400";
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      REVIEW: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      DONE: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[status] || "bg-white/10 text-slate-400";
  };

  const getTypeBadge = (type) => {
    const types = {
      TASK: "bg-blue-500/10 text-blue-400",
      BUG: "bg-red-500/10 text-red-400",
      STORY: "bg-purple-500/10 text-purple-400",
      EPIC: "bg-orange-500/10 text-orange-400",
    };
    return types[type] || "bg-slate-500/10 text-slate-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-xl">Ticket not found</p>
        <button onClick={() => navigate("/tickets")} className="mt-4 text-indigo-400">
          ← Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate("/tickets")} className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Back to Tickets
          </button>
          <h1 className="text-2xl font-bold text-white mt-2">{ticket.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${getTypeBadge(ticket.type)}`}>
              {ticket.type}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className="text-xs text-slate-400">#{ticket.id.slice(-6)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-400"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>

          <button
            onClick={handleEditToggle}
            className={`px-3 py-2 rounded-lg transition font-medium ${
              editing ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-indigo-500 text-white hover:bg-indigo-400"
            }`}
          >
            {editing ? "Cancel" : "Edit"}
          </button>

          <button onClick={handleDelete} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition font-medium">
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleUpdate} className="bg-white/[0.04] border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
              <select
                value={formData.type || "TASK"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="STORY">Story</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority || "MEDIUM"}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Story Points</label>
              <input
                type="number"
                value={formData.storyPoints || 0}
                onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition">
              💚 Save Changes
            </button>
            <button type="button" onClick={handleEditToggle} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-xs text-slate-400">Created By</p>
          <div className="flex items-center gap-2 mt-1">
            <User size={16} className="text-indigo-400" />
            <span className="text-white text-sm">{ticket.createdBy?.name || "Unknown"}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-xs text-slate-400">Assignee</p>
          <div className="flex items-center gap-2 mt-1">
            <User size={16} className="text-emerald-400" />
            <span className="text-white text-sm">{ticket.assignee?.name || "Unassigned"}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-xs text-slate-400">Created</p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={16} className="text-blue-400" />
            <span className="text-white text-sm">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-xs text-slate-400">Story Points</p>
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-white text-sm">{ticket.storyPoints || 0}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("comments")}
            className={`pb-2 px-1 text-sm font-medium transition ${
              activeTab === "comments" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageCircle size={16} className="inline mr-2" /> Comments
          </button>
          <button
            onClick={() => setActiveTab("attachments")}
            className={`pb-2 px-1 text-sm font-medium transition ${
              activeTab === "attachments" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Paperclip size={16} className="inline mr-2" /> Attachments
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-2 px-1 text-sm font-medium transition ${
              activeTab === "activity" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity size={16} className="inline mr-2" /> Activity
          </button>
        </div>
      </div>

      <div className="min-h-[300px]">
        {activeTab === "comments" && <CommentSection ticketId={ticket.id} />}
        {activeTab === "attachments" && <AttachmentUpload ticketId={ticket.id} />}
        {activeTab === "activity" && <ActivityTimeline ticketId={ticket.id} />}
      </div>

      {ticket.description && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Description</p>
          <p className="text-white text-sm">{ticket.description}</p>
        </div>
      )}
    </div>
  );
}
