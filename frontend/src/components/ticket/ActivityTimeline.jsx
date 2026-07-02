import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { activityAPI } from "../../services/api";
import { getSocket } from "../../socket";
import {
  Activity,
  UserPlus,
  Edit2,
  CheckCircle,
  Clock,
  MessageCircle,
  Paperclip,
} from "lucide-react";

const ActivityIcon = ({ type }) => {
  const icons = {
    CREATED: <Activity size={14} className="text-blue-400" />,
    UPDATED: <Edit2 size={14} className="text-yellow-400" />,
    DELETED: <Activity size={14} className="text-red-400" />,
    STATUS_CHANGED: <CheckCircle size={14} className="text-green-400" />,
    ASSIGNED: <UserPlus size={14} className="text-purple-400" />,
    COMMENTED: <MessageCircle size={14} className="text-indigo-400" />,
    ATTACHED: <Paperclip size={14} className="text-orange-400" />,
  };
  return icons[type] || <Activity size={14} className="text-slate-400" />;
};

export default function ActivityTimeline({ ticketId, projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [ticketId || projectId, page]);

  // Socket listener for new activities
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleActivityAdded = (activity) => {
      if (activity.ticketId === ticketId || activity.projectId === projectId) {
        setActivities((prev) => [activity, ...prev]);
      }
    };

    socket.on("activityAdded", handleActivityAdded);
    return () => socket.off("activityAdded", handleActivityAdded);
  }, [ticketId, projectId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let response;
      if (ticketId) {
        response = await activityAPI.listByTicket(ticketId, { page });
      } else if (projectId) {
        response = await activityAPI.list(projectId, { page });
      }
      setActivities((prev) =>
        page === 1
          ? response.data.activities
          : [...prev, ...response.data.activities],
      );
      setHasMore(response.data.pagination?.hasNext || false);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <Activity size={32} className="mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10" />

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3 relative">
            <div className="relative z-10">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <ActivityIcon type={activity.type} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white text-sm">
                  {activity.user?.name || "Unknown"}
                </span>
                <span className="text-slate-400 text-sm">
                  {activity.action}
                </span>
                {activity.ticket && (
                  <span className="text-indigo-400 text-sm">
                    #{activity.ticket.title}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatTime(activity.createdAt)}
              </p>
              {activity.metadata && (
                <p className="text-xs text-slate-500 mt-1">
                  {JSON.stringify(activity.metadata)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full mt-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition"
        >
          Load more...
        </button>
      )}
    </div>
  );
}
