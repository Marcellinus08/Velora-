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
  targetId: string; // post_id or reply_id or video_id or profile_addr depending on type
  targetType: "post" | "reply" | "video" | "profile";
  targetTitle?: string; // ✅ Title of the post/reply/video or username for follow
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  source: "community_likes" | "community_replies" | "reply_likes" | "video_purchases" | "video_likes" | "video_comments" | "notification_follows"; // which table it came from
  // Optional fields for video comments (via FK JOIN)
  commentText?: string; // From video_comments.content
  commentId?: string; // Reference to video_comments.id
};

export function useNotifications(abstractId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch actor profile data (avatar, username)
  const fetchActorProfile = async (address: string): Promise<{ name: string | null; avatar: string | null }> => {
    try {
      const res = await fetch(`/api/profiles/${address}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return { name: null, avatar: null };
      
      const data = await res.json();
      return {
        name: data.username || null,
        avatar: data.avatar_url || null,
      };
    } catch {
      return { name: null, avatar: null };
    }
  };

  // ✅ Fetch target title (post content, reply text, or video title)
  const fetchTargetTitle = async (targetId: string, targetType: string): Promise<string> => {
    try {
      const res = await fetch(`/api/notifications/get-target-title?targetId=${targetId}&targetType=${targetType}`, { cache: "no-store" });
      if (!res.ok) return "Unknown";
      
      const data = await res.json();
      return data.title || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // Fetch notifications from all 6 tables
  const fetchNotifications = useCallback(async () => {
    if (!abstractId) {
setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const addr = abstractId.toLowerCase();
    console.log("[useNotifications] Starting fetch for addr:", addr);
    const startTime = performance.now();

try {
      const supabase = createClient();

      // Query 7 notification tables (6 legacy + notification_follows + video_comments)
      console.log("[useNotifications] Fetching from all 7 tables...");
      const [likesRes, repliesRes, replyLikesRes, videoPurchasesRes, videoLikesRes, videoCommentsRes, followsRes] = await Promise.all([
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
          .select("*")
          .eq("receiver_addr", addr)
          .order("created_at", { ascending: false }),

        supabase
          .from("notification_follows")
          .select("*")
          .eq("followee_addr", addr)
          .order("created_at", { ascending: false }),
      ]);

      if (likesRes.error) throw new Error(likesRes.error.message);
      if (repliesRes.error) throw new Error(repliesRes.error.message);
      if (replyLikesRes.error) throw new Error(replyLikesRes.error.message);
      if (videoPurchasesRes.error) throw new Error(videoPurchasesRes.error.message);
      if (videoLikesRes.error) throw new Error(videoLikesRes.error.message);
      if (videoCommentsRes.error) throw new Error(videoCommentsRes.error.message);
      if (followsRes.error) throw new Error(followsRes.error.message);

      const queryTime = performance.now() - startTime;
      console.log("[useNotifications] Queries completed in", queryTime.toFixed(2), "ms");
      console.log("[useNotifications] Query results:", {
        likes: likesRes.data?.length || 0,
        replies: repliesRes.data?.length || 0,
        replyLikes: replyLikesRes.data?.length || 0,
        videoPurchases: videoPurchasesRes.data?.length || 0,
        videoLikes: videoLikesRes.data?.length || 0,
        videoComments: videoCommentsRes.data?.length || 0,
        follows: followsRes.data?.length || 0,
        totalNotifications: (likesRes.data?.length || 0) + (repliesRes.data?.length || 0) + (replyLikesRes.data?.length || 0) + (videoPurchasesRes.data?.length || 0) + (videoLikesRes.data?.length || 0) + (videoCommentsRes.data?.length || 0) + (followsRes.data?.length || 0),
      });

if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {

} else {

}
if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {
}

      // Combine and normalize all notifications
      const allNotifs: Notification[] = [];

      // ✅ SIMPLIFIED: Display raw notifications WITHOUT enrichment
      // This ensures data appears immediately from database
      const allRawNotifs: any[] = [
        ...(likesRes.data || []),
        ...(repliesRes.data || []),
        ...(replyLikesRes.data || []),
        ...(videoPurchasesRes.data || []),
        ...(videoLikesRes.data || []),
        ...(videoCommentsRes.data || []),
        ...(followsRes.data || []),
      ];

      console.log("[useNotifications] ⚡ FAST PATH: Processing", allRawNotifs.length, "raw notifications WITHOUT enrichment");

      // ✅ SIMPLIFIED: Just map raw data directly to Notification format
      // Skip actor profile and title fetching for now - display immediately
      
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
          targetTitle: "Post",
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
          targetTitle: "Reply",
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
          targetTitle: "Reply",
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
          targetTitle: "Video",
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
          targetTitle: "Video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_likes",
        });
      });

      // Add video comments
      (videoCommentsRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.receiver_addr,
          actorAddress: n.commenter_addr,
          actorName: null,
          actorAvatar: null,
          type: "video_comment",
          targetId: n.video_id,
          targetType: "video",
          targetTitle: "Video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_comments",
        });
      });

      // Add follows
      (followsRes.data || []).forEach((n: any) => {
        allNotifs.push({
          id: n.id,
          recipientAddr: n.followee_addr,
          actorAddress: n.follower_addr,
          actorName: null,
          actorAvatar: null,
          type: "follow",
          targetId: n.follower_addr,
          targetType: "profile",
          targetTitle: "Profile",
          message: "started following you",
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "notification_follows",
        });
      });

      // Sort by created_at DESC
      allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log("[useNotifications] ✅ Final notifications ready:", {
        totalProcessed: allNotifs.length,
        unreadCount: allNotifs.filter((n) => !n.isRead).length,
        notifications: allNotifs.map((n) => ({
          id: n.id,
          type: n.type,
          actor: n.actorName || n.actorAddress,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
      });
      
setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("[useNotifications] ❌ Error fetching notifications:", error);
setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [abstractId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
// Find which table this notification came from
      const notif = notifications.find((n) => n.id === notificationId);
      if (!notif) {
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
      } else if (notif.source === "notification_follows") {
        tableName = "notification_follows";
      } else {
return;
      }

      const { error } = await (supabase as any)
        .from(tableName)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
throw new Error(error.message);
      }
// Optimistically update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
}
  }, [notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!abstractId) {
return;
    }

    try {
const addr = abstractId.toLowerCase();
      const supabase = createClient();
      const now = new Date().toISOString();

      // Update all 7 notification tables
      const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
        (supabase as any)
          .from("notification_community_likes")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        (supabase as any)
          .from("notification_community_replies")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        (supabase as any)
          .from("notification_reply_likes")
          .update({ is_read: true, read_at: now })
          .eq("recipient_addr", addr)
          .eq("is_read", false),
        
        (supabase as any)
          .from("notification_video_purchases")
          .update({ is_read: true, read_at: now })
          .eq("creator_addr", addr)
          .eq("is_read", false),

        (supabase as any)
          .from("notification_video_likes")
          .update({ is_read: true, read_at: now })
          .eq("creator_addr", addr)
          .eq("is_read", false),

        (supabase as any)
          .from("notification_video_comments")
          .update({ is_read: true, read_at: now })
          .eq("receiver_addr", addr)
          .eq("is_read", false),

        (supabase as any)
          .from("notification_follows")
          .update({ is_read: true, read_at: now })
          .eq("followee_addr", addr)
          .eq("is_read", false),
      ]);

      if (res1.error) throw new Error(res1.error.message);
      if (res2.error) throw new Error(res2.error.message);
      if (res3.error) throw new Error(res3.error.message);
      if (res4.error) throw new Error(res4.error.message);
      if (res5.error) throw new Error(res5.error.message);
      if (res6.error) throw new Error(res6.error.message);
      if (res7.error) throw new Error(res7.error.message);
// Optimistically update local state
      const nowIso = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: nowIso })));
      setUnreadCount(0);
    } catch (error) {
}
  }, [abstractId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
// Find which table this notification came from
      const notif = notifications.find((n) => n.id === notificationId);
      if (!notif) {
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
      } else if (notif.source === "notification_follows") {
        tableName = "notification_follows";
      } else {
return;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", notificationId);

      if (error) {
throw new Error(error.message);
      }
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
}
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!abstractId) {
return;
    }

    const addr = abstractId.toLowerCase();
    const supabase = createClient();
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
handleRealtimeChange(payload, "community_likes");
        }
      )
      .subscribe((status) => {
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
handleRealtimeChange(payload, "community_replies");
        }
      )
      .subscribe((status) => {
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
handleRealtimeChange(payload, "reply_likes");
        }
      )
      .subscribe((status) => {
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
handleRealtimeChange(payload, "video_purchases");
        }
      )
      .subscribe((status) => {
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
handleRealtimeChange(payload, "video_likes");
        }
      )
      .subscribe((status) => {
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
          filter: `receiver_addr=eq.${addr}`,
        },
        (payload) => {
handleRealtimeChange(payload, "video_comments");
        }
      )
      .subscribe((status) => {
});

    // Subscribe to follows
    const followsChannel = supabase
      .channel(`notif-follows-${addr}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_follows",
          filter: `followee_addr=eq.${addr}`,
        },
        (payload) => {
handleRealtimeChange(payload, "notification_follows");
        }
      )
      .subscribe((status) => {
});

    return () => {
supabase.removeChannel(likesChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(replyLikesChannel);
      supabase.removeChannel(videoPurchasesChannel);
      supabase.removeChannel(videoLikesChannel);
      supabase.removeChannel(videoCommentsChannel);
      supabase.removeChannel(followsChannel);
    };
  }, [abstractId, fetchNotifications]);

  // Handle real-time changes
  const handleRealtimeChange = useCallback(
    (payload: any, source: "community_likes" | "community_replies" | "reply_likes" | "video_purchases" | "video_likes" | "video_comments" | "notification_follows") => {
      if (payload.eventType === "INSERT") {
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
        } else if (source === "video_comments") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.receiver_addr,
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
        } else {
          // notification_follows
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.followee_addr,
            actorAddress: payload.new.follower_addr,
            actorName: null,
            actorAvatar: null,
            type: "follow",
            targetId: payload.new.follower_addr,
            targetType: "profile",
            message: "Someone started following you",
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source: "notification_follows",
          };
        }

        setNotifications((prev) => [newNotif, ...prev]);
        if (!newNotif.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } else if (payload.eventType === "UPDATE") {
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
