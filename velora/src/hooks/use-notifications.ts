// src/hooks/use-notifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export type Notification = {
  id: string;
  abstractId: string;
  actorAddress: string;
  actorName: string | null;
  actorAvatar: string | null;
  type: "like" | "comment" | "reply" | "follow";
  targetId: string;
  targetType: "post" | "comment" | "video";
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export function useNotifications(abstractId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!abstractId) {
      console.log("[useNotifications] No abstractId, skipping fetch");
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log("[useNotifications] Fetching notifications for:", abstractId);
    
    try {
      const response = await fetch(`/api/notifications?abstract_id=${abstractId}`);
      console.log("[useNotifications] Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[useNotifications] API Error:", errorData);
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      console.log("[useNotifications] Received data:", data);
      
      const notifs = (data.notifications || []).map((n: any) => ({
        id: n.id,
        abstractId: n.abstract_id,
        actorAddress: n.actor_addr,
        actorName: n.actor_profile?.username || null,
        actorAvatar: n.actor_profile?.avatar_url || null,
        type: n.type,
        targetId: n.target_id,
        targetType: n.target_type,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
        readAt: n.read_at,
      }));

      console.log("[useNotifications] Processed notifications:", notifs.length);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("[useNotifications] Fetch error:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [abstractId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log("[useNotifications] Marking as read:", notificationId);
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[useNotifications] Mark as read API error:", errorData);
        throw new Error(errorData.error || "Failed to mark as read");
      }

      console.log("[useNotifications] Successfully marked as read");

      // Optimistically update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("[useNotifications] Mark as read error:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!abstractId) {
      console.warn("[useNotifications] No abstractId for mark all as read");
      return;
    }

    try {
      console.log("[useNotifications] Marking all as read for:", abstractId);
      
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstract_id: abstractId }),
      });

      console.log("[useNotifications] Mark all response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[useNotifications] Mark all API error:", errorData);
        throw new Error(errorData.error || "Failed to mark all as read");
      }

      console.log("[useNotifications] Successfully marked all as read");

      // Optimistically update local state
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: now })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[useNotifications] Mark all as read error:", error);
    }
  }, [abstractId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      // Optimistically update local state
      setNotifications((prev) => {
        const deleted = prev.find((n) => n.id === notificationId);
        const newNotifs = prev.filter((n) => n.id !== notificationId);
        
        if (deleted && !deleted.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        
        return newNotifs;
      });
    } catch (error) {
      console.error("[useNotifications] Delete error:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!abstractId) return;

    const supabase = createClient();
    console.log("[useNotifications] Setting up real-time subscription for:", abstractId);

    const channel = supabase
      .channel(`notifications:${abstractId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `abstract_id=eq.${abstractId}`,
        },
        (payload) => {
          console.log("[useNotifications] Real-time INSERT:", payload);
          
          const newNotif = {
            id: payload.new.id,
            abstractId: payload.new.abstract_id,
            actorAddress: payload.new.actor_addr,
            actorName: null, // Will be fetched separately or updated
            actorAvatar: null,
            type: payload.new.type,
            targetId: payload.new.target_id,
            targetType: payload.new.target_type,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          if (!newNotif.isRead) {
            setUnreadCount((prev) => prev + 1);
          }

          // Fetch full notification with profile
          fetchNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `abstract_id=eq.${abstractId}`,
        },
        (payload) => {
          console.log("[useNotifications] Real-time UPDATE:", payload);
          
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id
                ? {
                    ...n,
                    isRead: payload.new.is_read,
                    readAt: payload.new.read_at,
                  }
                : n
            )
          );

          // Recalculate unread count
          setNotifications((prev) => {
            setUnreadCount(prev.filter((n) => !n.isRead).length);
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `abstract_id=eq.${abstractId}`,
        },
        (payload) => {
          console.log("[useNotifications] Real-time DELETE:", payload);
          
          setNotifications((prev) => {
            const deleted = prev.find((n) => n.id === payload.old.id);
            const newNotifs = prev.filter((n) => n.id !== payload.old.id);
            
            if (deleted && !deleted.isRead) {
              setUnreadCount((count) => Math.max(0, count - 1));
            }
            
            return newNotifs;
          });
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Subscription status:", status);
      });

    return () => {
      console.log("[useNotifications] Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [abstractId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
