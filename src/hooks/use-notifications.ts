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
  type:
    | "like"
    | "like_reply"
    | "reply"
    | "nested_reply"
    | "follow"
    | "video_purchase"
    | "video_like"
    | "video_comment";
  targetId: string; // post_id or reply_id or video_id or profile_addr depending on type
  targetType: "post" | "reply" | "video" | "profile";
  targetTitle?: string; // Title of the post/reply/video or username for follow
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  source:
    | "community_likes"
    | "community_replies"
    | "reply_likes"
    | "video_purchases"
    | "video_likes"
    | "video_comments"
    | "notification_follows"; // which table it came from
  // Optional fields for video comments
  commentText?: string; // From video_comments.content (heuristik)
  commentId?: string; // (tidak dipakai di versi ini)
};

export function useNotifications(abstractId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Helpers --------------------------------------------------------------

  // Fetch actor profile data (avatar, username)
  const fetchActorProfile = async (
    address: string
  ): Promise<{ name: string | null; avatar: string | null }> => {
    try {
      const res = await fetch(`/api/profiles/${address}?t=${Date.now()}`, {
        cache: "no-store",
      });
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

  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

  const batchGetVideoTitles = async (ids: string[]) => {
    const map: Record<string, string> = {};
    if (!ids.length) return map;
    const supabase = createClient();
    const { data } = await supabase
      .from("videos")
      .select("id,title")
      .in("id", uniq(ids));
    (data || []).forEach((r: any) => (map[r.id] = r.title || "Video"));
    return map;
  };

  const batchGetPostTitles = async (ids: string[]) => {
    const map: Record<string, string> = {};
    if (!ids.length) return map;
    const supabase = createClient();
    const { data } = await supabase
      .from("community_posts")
      .select("id,title")
      .in("id", uniq(ids));
    (data || []).forEach((r: any) => (map[r.id] = r.title || "Post"));
    return map;
  };

  const batchGetReplyPreviews = async (ids: string[]) => {
    const map: Record<string, string> = {};
    if (!ids.length) return map;
    const supabase = createClient();
    const { data } = await supabase
      .from("community_replies")
      .select("id,content")
      .in("id", uniq(ids));
    (data || []).forEach((r: any) => {
      const c = r.content || "Reply";
      map[r.id] = c.slice(0, 50) + (c.length > 50 ? "..." : "");
    });
    return map;
  };

  // Ambil isi komentar berbasis (video_id, commenter_addr, created_at notif)
  const getNearestCommentContent = async (args: {
    video_id: string;
    commenter_addr: string;
    notif_created_at: string;
  }) => {
    const supabase = createClient();

    // 1) cari komentar terakhir sebelum/sama dengan created_at notif
    let { data, error } = await supabase
      .from("video_comments")
      .select("id,content,created_at")
      .eq("video_id", args.video_id)
      .eq("user_addr", args.commenter_addr)
      .lte("created_at", args.notif_created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2) fallback: kalau tidak ada, cari komentar paling awal setelahnya
    if (!data || error) {
      const res2 = await supabase
        .from("video_comments")
        .select("id,content,created_at")
        .eq("video_id", args.video_id)
        .eq("user_addr", args.commenter_addr)
        .gte("created_at", args.notif_created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      data = res2.data ?? null;
    }

  const content = (data as any)?.content || "Comment";
    return content.slice(0, 200) + (content.length > 200 ? "..." : "");
  };

  // --- Main fetch -----------------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    if (!abstractId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const addr = abstractId.toLowerCase();
    const startTime = performance.now();

    try {
      const supabase = createClient();

      // Query 7 notification tables (6 legacy + follows + video_comments)
      const [
        likesRes,
        repliesRes,
        replyLikesRes,
        videoPurchasesRes,
        videoLikesRes,
        videoCommentsRes,
        followsRes,
      ] = await Promise.all([
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

      // Error guard
      const resArr = [
        likesRes,
        repliesRes,
        replyLikesRes,
        videoPurchasesRes,
        videoLikesRes,
        videoCommentsRes,
        followsRes,
      ];
      for (const r of resArr) {
        if ((r as any).error) throw new Error((r as any).error.message);
      }

      // Kumpulkan ID untuk batch fetch
      const videoIds: string[] = [];
      const postIds: string[] = [];
      const replyIds: string[] = [];

      (videoPurchasesRes.data || []).forEach((n: any) => videoIds.push(n.video_id));
      (videoLikesRes.data || []).forEach((n: any) => videoIds.push(n.video_id));
      (videoCommentsRes.data || []).forEach((n: any) => videoIds.push(n.video_id));

      (likesRes.data || []).forEach((n: any) => postIds.push(n.post_id));
      (repliesRes.data || []).forEach((n: any) => replyIds.push(n.reply_id));
      (replyLikesRes.data || []).forEach((n: any) => replyIds.push(n.reply_id));

      // Batch ambil judul/preview
      const [videoTitleMap, postTitleMap, replyPreviewMap] = await Promise.all([
        batchGetVideoTitles(videoIds),
        batchGetPostTitles(postIds),
        batchGetReplyPreviews(replyIds),
      ]);

      // Ambil isi komentar per-notif video_comments (tanpa comment_id)
      const commentMap: Record<string, string> = {};
      await Promise.all(
        (videoCommentsRes.data || []).map(async (n: any) => {
          const text = await getNearestCommentContent({
            video_id: n.video_id,
            commenter_addr: n.commenter_addr,
            notif_created_at: n.created_at,
          });
          commentMap[n.id] = text;
        })
      );

      // Susun notifikasi mentah dengan title/comment yang benar
      const allNotifs: Notification[] = [];

      // Likes → Post
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
          targetTitle: postTitleMap[n.post_id] || "Post",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_likes",
        });
      });

      // Replies → Reply preview
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
          targetTitle: replyPreviewMap[n.reply_id] || "Reply",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "community_replies",
        });
      });

      // Reply likes → Reply preview
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
          targetTitle: replyPreviewMap[n.reply_id] || "Reply",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "reply_likes",
        });
      });

      // Video purchases → Video title
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
          targetTitle: videoTitleMap[n.video_id] || "Video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_purchases",
        });
      });

      // Video likes → Video title
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
          targetTitle: videoTitleMap[n.video_id] || "Video",
          message: n.message,
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_likes",
        });
      });

      // Video comments → Video title + comment content
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
          targetTitle: videoTitleMap[n.video_id] || "Video",
          commentText: commentMap[n.id],
          message: n.message, // akan di-regenerate di bawah
          isRead: n.is_read,
          createdAt: n.created_at,
          readAt: n.read_at,
          source: "video_comments",
        });
      });

      // Follows
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

      // Fetch actor profiles untuk enrichment
      const uniqueActors = uniq(allNotifs.map((n) => n.actorAddress));
      const actorProfiles: Record<
        string,
        { name: string | null; avatar: string | null }
      > = {};
      for (const actorAddr of uniqueActors) {
        try {
          actorProfiles[actorAddr] = await fetchActorProfile(actorAddr);
        } catch {
          actorProfiles[actorAddr] = { name: null, avatar: null };
        }
      }

      // Enrich message final (tanpa placeholder "...")
      const enrichedNotifs = allNotifs.map((n) => {
        const profile = actorProfiles[n.actorAddress];
        const actorName =
          profile?.name ||
          `${n.actorAddress.slice(0, 6)}...${n.actorAddress.slice(-4)}`;

        let finalMessage = n.message;

        if (n.source === "video_comments") {
          const title = n.targetTitle || "Video";
          const commentContent = n.commentText || "...";
          finalMessage = `{actor} commented on your video "${title}": "${commentContent}"`;
        } else if (n.source === "video_likes") {
          finalMessage = `{actor} liked your video "${n.targetTitle || "Video"}".`;
        } else if (n.source === "video_purchases") {
          finalMessage = `{actor} purchased your video "${n.targetTitle || "Video"}".`;
        } else if (n.source === "community_likes") {
          finalMessage = `{actor} liked your post "${n.targetTitle || "Post"}".`;
        } else if (n.source === "community_replies") {
          finalMessage = `{actor} replied: "${n.targetTitle || "Reply"}"`;
        } else if (n.source === "reply_likes") {
          finalMessage = `{actor} liked your reply: "${n.targetTitle || "Reply"}".`;
        } else if (n.source === "notification_follows") {
          finalMessage = "{actor} started following you";
        }

        return {
          ...n,
          actorName: profile?.name || null,
          actorAvatar: profile?.avatar || null,
          message: finalMessage.replace("{actor}", actorName),
        };
      });

      enrichedNotifs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(enrichedNotifs);
      setUnreadCount(enrichedNotifs.filter((n) => !n.isRead).length);

      const queryTime = performance.now() - startTime;
      console.log("[useNotifications] done in", queryTime.toFixed(2), "ms");
    } catch (error) {
      console.error("[useNotifications] ❌ Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [abstractId]);

  // --- Actions ---------------------------------------------------------------

  // Mark as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const notif = notifications.find((n) => n.id === notificationId);
        if (!notif) return;

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

        if (error) throw new Error(error.message);

        // Optimistic UI
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    },
    [notifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!abstractId) return;

    try {
      const addr = abstractId.toLowerCase();
      const supabase = createClient();
      const now = new Date().toISOString();

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

      const arr = [res1, res2, res3, res4, res5, res6, res7];
      for (const r of arr) {
        if ((r as any).error) throw new Error((r as any).error.message);
      }

      const nowIso = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: nowIso }))
      );
      setUnreadCount(0);
    } catch {}
  }, [abstractId]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const notif = notifications.find((n) => n.id === notificationId);
        if (!notif) return;

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

        if (error) throw new Error(error.message);

        // Optimistic UI
        setNotifications((prev) => {
          const deleted = prev.find((n) => n.id === notificationId);
          const newNotifs = prev.filter((n) => n.id !== notificationId);
          if (deleted && !deleted.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return newNotifs;
        });
      } catch {}
    },
    [notifications]
  );

  // --- Effects ---------------------------------------------------------------

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription + enrich cepat untuk video_comments
  useEffect(() => {
    if (!abstractId) return;

    const addr = abstractId.toLowerCase();
    const supabase = createClient();

    const subscribe = (
      name: string,
      table: string,
      filter: string,
      source: Notification["source"]
    ) =>
      supabase
        .channel(name)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, filter },
          (payload) => handleRealtimeChange(payload, source)
        )
        .subscribe();

    const likesChannel = subscribe(
      `notif-likes-${addr}`,
      "notification_community_likes",
      `recipient_addr=eq.${addr}`,
      "community_likes"
    );

    const repliesChannel = subscribe(
      `notif-replies-${addr}`,
      "notification_community_replies",
      `recipient_addr=eq.${addr}`,
      "community_replies"
    );

    const replyLikesChannel = subscribe(
      `notif-reply-likes-${addr}`,
      "notification_reply_likes",
      `recipient_addr=eq.${addr}`,
      "reply_likes"
    );

    const videoPurchasesChannel = subscribe(
      `notif-video-purchases-${addr}`,
      "notification_video_purchases",
      `creator_addr=eq.${addr}`,
      "video_purchases"
    );

    const videoLikesChannel = subscribe(
      `notif-video-likes-${addr}`,
      "notification_video_likes",
      `creator_addr=eq.${addr}`,
      "video_likes"
    );

    const videoCommentsChannel = subscribe(
      `notif-video-comments-${addr}`,
      "notification_video_comments",
      `receiver_addr=eq.${addr}`,
      "video_comments"
    );

    const followsChannel = subscribe(
      `notif-follows-${addr}`,
      "notification_follows",
      `followee_addr=eq.${addr}`,
      "notification_follows"
    );

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

  // Handle real-time changes (INSERT/UPDATE/DELETE)
  const handleRealtimeChange = useCallback(
    (
      payload: any,
      source:
        | "community_likes"
        | "community_replies"
        | "reply_likes"
        | "video_purchases"
        | "video_likes"
        | "video_comments"
        | "notification_follows"
    ) => {
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
            targetTitle: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
          };
        } else if (source === "community_replies") {
          newNotif = {
            id: payload.new.id,
            recipientAddr: payload.new.recipient_addr,
            actorAddress: payload.new.actor_addr,
            actorName: null,
            actorAvatar: null,
            type:
              payload.new.type === "nested_reply" ? "nested_reply" : "reply",
            targetId: payload.new.reply_id,
            targetType: "reply",
            targetTitle: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
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
            targetTitle: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
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
            targetTitle: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
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
            targetTitle: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
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
            targetTitle: undefined,
            commentText: undefined,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
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
            targetTitle: "Profile",
            message: "Someone started following you",
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            readAt: payload.new.read_at,
            source,
          };
        }

        // Masukkan dulu agar UI cepat muncul
        setNotifications((prev) => [newNotif, ...prev]);
        if (!newNotif.isRead) setUnreadCount((prev) => prev + 1);

        // Enrich cepat khusus video_comments supaya tidak "..."
        if (source === "video_comments") {
          (async () => {
            try {
              const supabase = createClient();
              const [vRes] = await Promise.all([
                supabase
                  .from("videos")
                  .select("title")
                  .eq("id", payload.new.video_id)
                  .single(),
              ]);

              const title = (vRes.data as any)?.title || "Video";
              const content = await getNearestCommentContent({
                video_id: payload.new.video_id,
                commenter_addr: payload.new.commenter_addr,
                notif_created_at: payload.new.created_at,
              });

              const prof = await fetchActorProfile(payload.new.commenter_addr);
              const actorName =
                prof?.name ||
                `${payload.new.commenter_addr.slice(0, 6)}...${payload.new.commenter_addr.slice(-4)}`;

              setNotifications((prev) =>
                prev.map((x) =>
                  x.id === payload.new.id
                    ? {
                        ...x,
                        targetTitle: title,
                        commentText: content,
                        actorName: prof?.name || null,
                        actorAvatar: prof?.avatar || null,
                        message: `{actor} commented on your video "${title}": "${content}"`.replace(
                          "{actor}",
                          actorName
                        ),
                      }
                    : x
                )
              );
            } catch {}
          })();
        }
      } else if (payload.eventType === "UPDATE") {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === payload.new.id
              ? { ...n, isRead: payload.new.is_read, readAt: payload.new.read_at }
              : n
          )
        );

        // Recalculate unread
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
