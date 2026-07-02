// frontend/src/components/ui/NotificationPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import { notificationAPI } from "../../services/api";
import { Bell, X, BellOff } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.list();
      setNotifications(response.data?.data?.notifications || []);

      try {
        const countResponse = await notificationAPI.getUnreadCount();
        setUnreadCount(countResponse.data?.data?.unreadCount || 0);
      } catch (countError) {
        const unread = notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle real-time notifications
  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  useSocket("notification", handleNewNotification);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("❌ Failed to mark as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("❌ Failed to mark all as read:", error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:text-white hover:bg-white/10"
        aria-label="Notifications"
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden bg-slate-800 border border-white/10 rounded-lg shadow-2xl z-50">
          <div className="p-3 border-b border-white/10 flex justify-between items-center bg-slate-800/95">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell size={16} className="text-indigo-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  type="button"
                >
                  Read all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-2 overflow-y-auto max-h-72">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <BellOff size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-1 transition-all cursor-pointer ${
                    notification.read
                      ? "bg-transparent hover:bg-white/5"
                      : "bg-indigo-500/10 hover:bg-indigo-500/20 border-l-2 border-indigo-400"
                  }`}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <p
                    className={`text-sm ${notification.read ? "text-slate-400" : "text-white"}`}
                  >
                    {notification.message}
                  </p>
                  <span className="text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
