"use client";

import { useEffect, useState } from "react";

interface FollowNotification {
  id: string;
  abstract_id: string;
  user_id: string;
  actor_addr: string;
  actor_profile?: {
    abstract_id: string;
    username: string;
    avatar_url: string;
  };
  type: string;
  message: string;
  target_id: string | null;
  target_type: string | null;
  metadata: {
    follower_username?: string;
    follower_avatar?: string;
  };
  is_read: boolean;
  created_at: string;
}

interface UseFollowNotificationsOptions {
  userAddr?: string;
  unreadOnly?: boolean;
  pollInterval?: number; // in ms, default 30000 (30s)
}

/**
 * Hook untuk fetch dan manage follow notifications
 */
export function useFollowNotifications({
  userAddr,
  unreadOnly = false,
  pollInterval = 30000,
}: UseFollowNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userAddr) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        abstract_id: userAddr.toLowerCase(),
        unread_only: unreadOnly.toString(),
      });

      const response = await fetch(`/api/notifications?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      
      // Filter untuk hanya follow notifications
      const followNotifs = (data.notifications || []).filter(
        (n: any) => n.type === "follow"
      ) as FollowNotification[];

      setNotifications(followNotifs);

      // Count unread
      const unread = followNotifs.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useFollowNotifications] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[useFollowNotifications] Error marking as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstract_id: userAddr?.toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("[useFollowNotifications] Error marking all as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deleted && !deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("[useFollowNotifications] Error deleting notification:", err);
    }
  };

  // Auto-fetch on mount and poll
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [userAddr, unreadOnly, pollInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
