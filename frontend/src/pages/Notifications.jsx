import { useState, useEffect } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import {
  FiBell,
  FiCheckCircle,
  FiX,
  FiClock,
  FiUser,
  FiEdit,
} from "react-icons/fi";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (page = 1, refresh = false) => {
    setLoading(true);
    try {
      const response = await api.get("/notifications", {
        params: { page },
      });

      const newNotifications = response.data.data.data;
      const total = response.data.data.total;
      const perPage = response.data.data.per_page;

      if (refresh) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      // Count unread notifications
      const unread = newNotifications.filter(
        (n) => !n.read_at
      ).length;
      setUnreadCount((prev) => (refresh ? unread : prev + unread));

      setHasMore(page * perPage < total);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      toast.error("Failed to load notifications");
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUncountCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error("Failed to mark notification as read");
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all notifications as read");
      console.error("Mark all as read error:", err);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  // Get notification type icon and color
  const getNotificationIcon = (type) => {
    switch (type) {
      case "job_status_changed":
        return <FiEdit />;
      case "interview_completed":
        return <FiCheckCircle />;
      case "admin_announcement":
        return <FiBell />;
      case "welcome":
        return <FiUser />;
      default:
        return <FiBell />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "job_status_changed":
        return "text-blue-400";
      case "interview_completed":
        return "text-green-400";
      case "admin_announcement":
        return "text-yellow-400";
      case "welcome":
        return "text-purple-400";
      default:
        return "text-zinc-400";
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-zinc-400">Loading notifications...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiBell />
            Notifications
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className={`px-4 py-2 rounded-lg transition-all hover:bg-zinc-700 ${unreadCount === 0 ? "opacity-50 cursor-not-allowed" : "bg-zinc-800"
                }`}
            >
              {unreadCount > 0 ? (
                <>
                  <FiCheckCircle className="mr-2" />
                  Mark All as Read ({unreadCount})
                </>
              ) : (
                <span>Mark All as Read</span>
              )}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {notifications.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiBell className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400">No notifications yet</p>
            <p className="text-zinc-500 text-sm mt-1">
              You'll see updates here when jobs status change, interviews are completed, or admin sends announcements.
            </p>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const type = notification.data?.type || "unknown";
              const icon = getNotificationIcon(type);
              const colorClass = getNotificationColor(type);
              const isRead = !!notification.read_at;
              const timeAgo = new Date(notification.created_at).toLocaleString(
                undefined,
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              );

              return (
                <div
                  key={notification.id}
                  className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors ${!isRead ? "border-l-4 border-blue-400" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-zinc-800/50 ${colorClass}`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-white flex-1">
                          {notification.data?.title || "Notification"}
                        </h3>
                        <span className="text-zinc-400 text-xs ml-3">
                          {timeAgo}
                        </span>
                      </div>
                      <p className="text-zinc-300">{notification.data?.message || notification.body}</p>
                      {!isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mt-2 px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded hover:text-white"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load more button */}
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Notifications;