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

try {
      const supabase = createClient();

      // Query 6 notification tables + notification_follows
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
          .select(`
            *,
            video_comments!inner(id, content, created_at)
          `)
          .eq("creator_addr", addr)
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

if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {

} else {

}
if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {
}

      // Combine and normalize all notifications
      const allNotifs: Notification[] = [];

      // ✅ Fetch actor profiles in parallel for all notifications
      const allRawNotifs: any[] = [
        ...(likesRes.data || []),
        ...(repliesRes.data || []),
        ...(replyLikesRes.data || []),
        ...(videoPurchasesRes.data || []),
        ...(videoLikesRes.data || []),
        ...(videoCommentsRes.data || []),
        ...(followsRes.data || []),
      ];

      // Get unique actor addresses
      const uniqueActors = new Set<string>();
      allRawNotifs.forEach((n: any) => {
        const actorAddr = n.actor_addr || n.buyer_addr || n.liker_addr || n.commenter_addr;
        if (actorAddr) uniqueActors.add(actorAddr.toLowerCase());
      });

      // Fetch all actor profiles in parallel
      const actorProfiles = new Map<string, { name: string | null; avatar: string | null }>();
      await Promise.all(
        Array.from(uniqueActors).map(async (addr) => {
          const profile = await fetchActorProfile(addr);
          actorProfiles.set(addr, profile);
        })
      );

      // ✅ Get unique target titles to fetch
      const uniqueTargets = new Set<string>();
      allRawNotifs.forEach((n: any) => {
        const targetId = n.post_id || n.reply_id || n.video_id;
        const targetType = n.post_id ? "post" : n.reply_id ? "reply" : "video";
        if (targetId) uniqueTargets.add(`${targetType}:${targetId}`);
      });

      // ✅ Fetch all target titles in parallel
      const targetTitles = new Map<string, string>();
      await Promise.all(
        Array.from(uniqueTargets).map(async (key) => {
          const [targetType, targetId] = key.split(":");
          const title = await fetchTargetTitle(targetId, targetType);
          targetTitles.set(key, title);
})
      );
// Add likes
      (likesRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.actor_addr.toLowerCase()) || { name: null, avatar: null };
        const titleKey = `post:${n.post_id}`;
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "like",
          targetId: n.post_id,
          targetType: "post",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_likes",
        });
      });

      // Add replies
      (repliesRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.actor_addr.toLowerCase()) || { name: null, avatar: null };
        const titleKey = `reply:${n.reply_id}`;
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: n.type === "nested_reply" ? "nested_reply" : "reply",
          targetId: n.reply_id,
          targetType: "reply",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_replies",
        });
      });

      // Add reply likes
      (replyLikesRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.actor_addr.toLowerCase()) || { name: null, avatar: null };
        const titleKey = `reply:${n.reply_id}`;
        allNotifs.push({
          id: n.id,
          recipientAddr: n.recipient_addr,
          actorAddress: n.actor_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "like_reply",
          targetId: n.reply_id,
          targetType: "reply",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "reply_likes",
        });
      });

      // Add video purchases
      (videoPurchasesRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.buyer_addr.toLowerCase()) || { name: null, avatar: null };
        const titleKey = `video:${n.video_id}`;
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.buyer_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "video_purchase",
          targetId: n.video_id,
          targetType: "video",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_purchases",
        });
      });

      // Add video likes
      (videoLikesRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.liker_addr.toLowerCase()) || { name: null, avatar: null };
        const titleKey = `video:${n.video_id}`;
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.liker_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "video_like",
          targetId: n.video_id,
          targetType: "video",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_likes",
        });
      });

      // Add video comments
      (videoCommentsRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.commenter_addr.toLowerCase()) || { name: null, avatar: null };
        const commentContent = n.video_comments?.content || n.message;
        const titleKey = `video:${n.video_id}`;
        
        allNotifs.push({
          id: n.id,
          recipientAddr: n.creator_addr,
          actorAddress: n.commenter_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "video_comment",
          targetId: n.video_id,
          targetType: "video",
          targetTitle: targetTitles.get(titleKey),
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_comments",
          commentText: commentContent,
          commentId: n.comment_id,
        });
      });

      // Add follows
      (followsRes.data || []).forEach((n: any) => {
        const actor = actorProfiles.get(n.follower_addr.toLowerCase()) || { name: null, avatar: null };
        
        allNotifs.push({
          id: n.id,
          recipientAddr: n.followee_addr,
          actorAddress: n.follower_addr,
          actorName: actor.name,
          actorAvatar: actor.avatar,
          type: "follow",
          targetId: n.follower_addr, // Profile address of the follower
          targetType: "profile",
          targetTitle: actor.name || "Someone", // Use follower's name as title
          message: `${actor.name || "Someone"} started following you`,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "notification_follows",
        });
      });

      // Sort by created_at DESC
      allNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter((n) => !n.isRead).length);
    } catch (error) {
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

      const { error } = await supabase
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

      // Update all 7 notification tables (6 legacy + notification_follows)
      const [res1, res2, res3, res4, res5, res6, res7] = await Promise.all([
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

        supabase
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
          filter: `creator_addr=eq.${addr}`,
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
