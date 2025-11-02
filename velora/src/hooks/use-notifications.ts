// src/hooks/use-notifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export type Notification = {
  id: string;
  recipientAddr: string;
  actorAddress: string;
  actorName: string | null;
  actorAvatar: string | null;
  type: "like" | "like_reply" | "reply" | "nested_reply" | "follow" | "video_purchase" | "video_like" | "video_comment";
  targetId: string; // post_id or reply_id or video_id depending on type
  targetType: "post" | "reply" | "video";
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  source: "community_likes" | "community_replies" | "reply_likes" | "video_purchases" | "video_likes" | "video_comments"; // which table it came from
  // Optional fields for video comments (via FK JOIN)
  commentText?: string; // From video_comments.content
  commentId?: string; // Reference to video_comments.id
};

export function useNotifications(abstractId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from all 6 tables
  const fetchNotifications = useCallback(async () => {
    if (!abstractId) {
      console.log("[useNotifications] No abstractId, skipping fetch");
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const addr = abstractId.toLowerCase();
    console.log("[useNotifications] ===== FETCH START =====");
    console.log("[useNotifications] Fetching for address:", addr);
    console.log("[useNotifications] Address type:", typeof addr, "Length:", addr?.length);
    
    try {
      const supabase = createClient();

      // Query 6 notification tables
      const [likesRes, repliesRes, replyLikesRes, videoPurchasesRes, videoLikesRes, videoCommentsRes] = await Promise.all([
        supabase
          .from("notification_community_likes")
          .select("*")
          .eq("recipient_addr", addr)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("notification_community_replies")
          .select("*")
          .eq("recipient_addr", addr)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("notification_reply_likes")
          .select("*")
          .eq("recipient_addr", addr)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("notification_video_purchases")
          .select("*")
          .eq("creator_addr", addr)
          .order("created_at", { ascending: false }),

        supabase
          .from("notification_video_likes")
          .select("*")
          .eq("creator_addr", addr)
          .order("created_at", { ascending: false }),

        supabase
          .from("notification_video_comments")
          .select(`
            *,
            video_comments!inner(id, content, created_at)
          `)
          .eq("creator_addr", addr)
          .order("created_at", { ascending: false }),
      ]);

      if (likesRes.error) throw new Error(likesRes.error.message);
      if (repliesRes.error) throw new Error(repliesRes.error.message);
      if (replyLikesRes.error) throw new Error(replyLikesRes.error.message);
      if (videoPurchasesRes.error) throw new Error(videoPurchasesRes.error.message);
      if (videoLikesRes.error) throw new Error(videoLikesRes.error.message);
      if (videoCommentsRes.error) throw new Error(videoCommentsRes.error.message);

      console.log("[useNotifications] ===== QUERY RESULTS =====");
      console.log("[useNotifications] Community Likes:", likesRes.data?.length || 0);
      console.log("[useNotifications] Community Replies:", repliesRes.data?.length || 0);
      console.log("[useNotifications] Reply Likes:", replyLikesRes.data?.length || 0);
      console.log("[useNotifications] Video Purchases:", videoPurchasesRes.data?.length || 0);
      console.log("[useNotifications] Video Likes:", videoLikesRes.data?.length || 0);
      console.log("[useNotifications] Video Comments:", videoCommentsRes.data?.length || 0);
      
      if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {
        console.log("[useNotifications] ⚠️  VIDEO PURCHASES FOUND!");
        console.log("[useNotifications] Data:", videoPurchasesRes.data);
      } else {
        console.log("[useNotifications] ⚠️  NO VIDEO PURCHASES FOUND - checking RLS issue");
        console.log("[useNotifications] Expected creator_addr:", addr);
      }

      console.log("[useNotifications] Fetch results:", {
        likes: likesRes.data?.length || 0,
        replies: repliesRes.data?.length || 0,
        replyLikes: replyLikesRes.data?.length || 0,
        videoPurchases: videoPurchasesRes.data?.length || 0,
        videoLikes: videoLikesRes.data?.length || 0,
        videoComments: videoCommentsRes.data?.length || 0,
      });

      if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {
        console.log("[useNotifications] Video purchases data:", videoPurchasesRes.data);
      }

      // Combine and normalize all notifications
      const allNotifs: Notification[] = [];

      // Add likes
      (likesRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: null,
          actorAvatar: null,
          type: "like",
          targetId: n.post_id,
          targetType: "post",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_likes",
        });
      });

      // Add replies
      (repliesRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: null,
          actorAvatar: null,
          type: n.type === "nested_reply" ? "nested_reply" : "reply",
          targetId: n.reply_id,
          targetType: "reply",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_replies",
        });
      });

      // Add reply likes
      (replyLikesRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: null,
          actorAvatar: null,
          type: "like_reply",
          targetId: n.reply_id,
          targetType: "reply",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "reply_likes",
        });
      });

      // Add video purchases
      (videoPurchasesRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.buyer_addr,
          actorName: null,
          actorAvatar: null,
          type: "video_purchase",
          targetId: n.video_id,
          targetType: "video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_purchases",
        });
      });

      // Add video likes
      (videoLikesRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.liker_addr,
          actorName: null,
          actorAvatar: null,
          type: "video_like",
          targetId: n.video_id,
          targetType: "video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_likes",
        });
      });

      // Add video comments
      (videoCommentsRes.data || []).forEach((n: any) => {
        // Get comment content from joined table
        const commentContent = n.video_comments?.content || n.message;
        
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.commenter_addr,
          actorName: null,
          actorAvatar: null,
          type: "video_comment",
          targetId: n.video_id,
          targetType: "video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_comments",
          // Extra: Comment content from FK relationship
          commentText: commentContent,
          commentId: n.comment_id,
        });
      });

      // Sort by created_at DESC
      allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log("[useNotifications] Processed notifications:", allNotifs.length, {
        likes: likesRes.data?.length || 0,
        replies: repliesRes.data?.length || 0,
        replyLikes: replyLikesRes.data?.length || 0,
        videoPurchases: videoPurchasesRes.data?.length || 0,
      });

      setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter((n) => !n.isRead).length);
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

      // Find which table this notification came from
      const notif = notifications.find((n) => n.id === notificationId);
      if (!notif) {
        console.warn("[useNotifications] Notification not found:", notificationId);
        return;
      }

      const supabase = createClient();
      let tableName: string;

      if (notif.source === "community_likes") {
        tableName = "notification_community_likes";
      } else if (notif.source === "community_replies") {
        tableName = "notification_community_replies";
      } else if (notif.source === "reply_likes") {
        tableName = "notification_reply_likes";
      } else if (notif.source === "video_purchases") {
        tableName = "notification_video_purchases";
      } else if (notif.source === "video_likes") {
        tableName = "notification_video_likes";
      } else if (notif.source === "video_comments") {
        tableName = "notification_video_comments";
      } else {
        console.error("[useNotifications] Unknown notification source:", notif.source);
        return;
      }

      const { error } = await supabase
        .from(tableName)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        console.error("[useNotifications] Mark as read error:", error);
        throw new Error(error.message);
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
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!abstractId) {
      console.warn("[useNotifications] No abstractId for mark all as read");
      return;
    }

    try {
      console.log("[useNotifications] Marking all as read for:", abstractId);
      
      const addr = abstractId.toLowerCase();
      const supabase = createClient();
      const now = new Date().toISOString();

      // Update all 6 notification tables
      const [res1, res2, res3, res4, res5, res6] = await Promise.all([
        supabase
          .from("notification_community_likes")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        supabase
          .from("notification_community_replies")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        supabase
          .from("notification_reply_likes")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        supabase
          .from("notification_video_purchases")
          .update({ is_read: true, read_at: now })
          .eq("creator_addr", addr)
          .eq("is_read", false),

        supabase
          .from("notification_video_likes")
          .update({ is_read: true, read_at: now })
          .eq("creator_addr", addr)
          .eq("is_read", false),

        supabase
          .from("notification_video_comments")
          .update({ is_read: true, read_at: now })
          .eq("creator_addr", addr)
          .eq("is_read", false),
      ]);

      if (res1.error) throw new Error(res1.error.message);
      if (res2.error) throw new Error(res2.error.message);
      if (res3.error) throw new Error(res3.error.message);
      if (res4.error) throw new Error(res4.error.message);
      if (res5.error) throw new Error(res5.error.message);
      if (res6.error) throw new Error(res6.error.message);

      console.log("[useNotifications] Successfully marked all as read");

      // Optimistically update local state
      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: nowIso })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[useNotifications] Mark all as read error:", error);
    }
  }, [abstractId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      console.log("[useNotifications] Deleting notification:", notificationId);

      // Find which table this notification came from
      const notif = notifications.find((n) => n.id === notificationId);
      if (!notif) {
        console.warn("[useNotifications] Notification not found:", notificationId);
        return;
      }

      const supabase = createClient();
      let tableName: string;

      if (notif.source === "community_likes") {
        tableName = "notification_community_likes";
      } else if (notif.source === "community_replies") {
        tableName = "notification_community_replies";
      } else if (notif.source === "reply_likes") {
        tableName = "notification_reply_likes";
      } else if (notif.source === "video_purchases") {
        tableName = "notification_video_purchases";
      } else if (notif.source === "video_likes") {
        tableName = "notification_video_likes";
      } else if (notif.source === "video_comments") {
        tableName = "notification_video_comments";
      } else {
        console.error("[useNotifications] Unknown notification source:", notif.source);
        return;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", notificationId);

      if (error) {
        console.error("[useNotifications] Delete error:", error);
        throw new Error(error.message);
      }

      console.log("[useNotifications] Successfully deleted notification");

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
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!abstractId) {
      console.log("[useNotifications] No abstractId, skipping real-time subscription");
      return;
    }

    const addr = abstractId.toLowerCase();
    const supabase = createClient();
    console.log("[useNotifications] 🔄 Setting up real-time subscriptions for:", addr);

    // Subscribe to likes
    const likesChannel = supabase
      .channel(`notif-likes-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_community_likes",
          filter: `recipient_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] 🔔 Likes channel event:", payload.eventType);
          handleRealtimeChange(payload, "community_likes");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Likes subscription status:", status);
      });

    // Subscribe to replies
    const repliesChannel = supabase
      .channel(`notif-replies-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_community_replies",
          filter: `recipient_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] 🔔 Replies channel event:", payload.eventType);
          handleRealtimeChange(payload, "community_replies");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Replies subscription status:", status);
      });

    // Subscribe to reply likes
    const replyLikesChannel = supabase
      .channel(`notif-reply-likes-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_reply_likes",
          filter: `recipient_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] � Reply likes channel event:", payload.eventType);
          handleRealtimeChange(payload, "reply_likes");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Reply likes subscription status:", status);
      });

    // Subscribe to video purchases
    const videoPurchasesChannel = supabase
      .channel(`notif-video-purchases-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_video_purchases",
          filter: `creator_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] 🔔 Video purchases channel event:", payload.eventType);
          handleRealtimeChange(payload, "video_purchases");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Video purchases subscription status:", status);
      });

    // Subscribe to video likes
    const videoLikesChannel = supabase
      .channel(`notif-video-likes-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_video_likes",
          filter: `creator_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] 🔔 Video likes channel event:", payload.eventType);
          handleRealtimeChange(payload, "video_likes");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Video likes subscription status:", status);
      });

    // Subscribe to video comments
    const videoCommentsChannel = supabase
      .channel(`notif-video-comments-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_video_comments",
          filter: `creator_addr=eq.${addr}`,
        },
        (payload) => {
          console.log("[useNotifications] 🔔 Video comments channel event:", payload.eventType);
          console.log("[useNotifications] 🔔 Video comments payload:", JSON.stringify(payload.new, null, 2));
          console.log("[useNotifications] 🔔 Filter check - creator_addr:", (payload.new as any)?.creator_addr, "vs filter addr:", addr);
          handleRealtimeChange(payload, "video_comments");
        }
      )
      .subscribe((status) => {
        console.log("[useNotifications] Video comments subscription status:", status);
      });

    return () => {
      console.log("[useNotifications] 🧹 Cleaning up real-time subscriptions");
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(replyLikesChannel);
      supabase.removeChannel(videoPurchasesChannel);
      supabase.removeChannel(videoLikesChannel);
      supabase.removeChannel(videoCommentsChannel);
    };
  }, [abstractId, fetchNotifications]);

  // Handle real-time changes
  const handleRealtimeChange = useCallback(
    (payload: any, source: "community_likes" | "community_replies" | "reply_likes" | "video_purchases" | "video_likes" | "video_comments") => {
      if (payload.eventType === "INSERT") {
        console.log("[useNotifications] ✅ INSERT detected:", payload.new.id);
        
        let newNotif: Notification;
        if (source === "community_likes") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.recipient_addr,
            actorAddress: payload.new.actor_addr,
            actorName: null,
            actorAvatar: null,
            type: "like",
            targetId: payload.new.post_id,
            targetType: "post",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "community_likes",
          };
        } else if (source === "community_replies") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.recipient_addr,
            actorAddress: payload.new.actor_addr,
            actorName: null,
            actorAvatar: null,
            type: payload.new.type === "nested_reply" ? "nested_reply" : "reply",
            targetId: payload.new.reply_id,
            targetType: "reply",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "community_replies",
          };
        } else if (source === "reply_likes") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.recipient_addr,
            actorAddress: payload.new.actor_addr,
            actorName: null,
            actorAvatar: null,
            type: "like_reply",
            targetId: payload.new.reply_id,
            targetType: "reply",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "reply_likes",
          };
        } else if (source === "video_purchases") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.creator_addr,
            actorAddress: payload.new.buyer_addr,
            actorName: null,
            actorAvatar: null,
            type: "video_purchase",
            targetId: payload.new.video_id,
            targetType: "video",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "video_purchases",
          };
        } else if (source === "video_likes") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.creator_addr,
            actorAddress: payload.new.liker_addr,
            actorName: null,
            actorAvatar: null,
            type: "video_like",
            targetId: payload.new.video_id,
            targetType: "video",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "video_likes",
          };
        } else {
          // video_comments
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.creator_addr,
            actorAddress: payload.new.commenter_addr,
            actorName: null,
            actorAvatar: null,
            type: "video_comment",
            targetId: payload.new.video_id,
            targetType: "video",
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "video_comments",
          };
        }

        setNotifications((prev) => [newNotif, ...prev]);
        if (!newNotif.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } else if (payload.eventType === "UPDATE") {
        console.log("[useNotifications] 🔄 UPDATE detected:", payload.new.id);
        
        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id === payload.new.id) {
              return {
                ...n,
                isRead: payload.new.is_read,
                readAt: payload.new.read_at,
              };
            }
            return n;
          })
        );

        // Recalculate unread count
        setNotifications((prev) => {
          const newUnreadCount = prev.filter((n) => !n.isRead).length;
          setUnreadCount(newUnreadCount);
          return prev;
        });
      } else if (payload.eventType === "DELETE") {
        console.log("[useNotifications] 🗑️ DELETE detected:", payload.old.id);
        
        setNotifications((prev) => {
          const deleted = prev.find((n) => n.id === payload.old.id);
          const newNotifs = prev.filter((n) => n.id !== payload.old.id);
          
          if (deleted && !deleted.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          
          return newNotifs;
        });
      }
    },
    []
  );

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
