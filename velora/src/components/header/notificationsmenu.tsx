"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MI } from "./MI";
import { useNotifications } from "@/hooks/use-notifications";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { AbstractProfile } from "@/components/abstract-profile";
import { NotificationListSkeleton } from "@/components/skeletons/notification-skeleton";
import { Suspense } from "react";

function getStoredAbstractAddress(): `0x${string}` | null {
  try {
    const raw =
      localStorage.getItem("wagmi.store") ||
      localStorage.getItem("abstract:session") ||
      localStorage.getItem("abstract_id") ||
      localStorage.getItem("wallet");
    if (!raw) return null;
    const m = raw.match(/0x[a-fA-F0-9]{40}/);
    return m ? (m[0].toLowerCase() as `0x${string}`) : null;
  } catch {
    return null;
  }
}

export default function NotificationsMenu() {
  const { address: wagmiAddress } = useAccount();
  
  // Fallback ke localStorage jika wagmi tidak return address
  const abstractId = ((wagmiAddress?.toLowerCase() as `0x${string}` | undefined) || getStoredAbstractAddress()) as `0x${string}` | undefined;
const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(abstractId);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "like_reply":
        return "❤️";
      case "reply":
        return "💬";
      case "nested_reply":
        return "↩️";
      case "follow":
        return "👥";
      case "video_purchase":
        return "💰";
      case "video_like":
        return "👍";
      case "video_comment":
        return "💬";
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
if (!isRead) {
      try {
        await markAsRead(id);
} catch (error) {
}
    }
  };

  const handleMarkAllAsRead = async () => {
try {
      await markAllAsRead();
} catch (error) {
}
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex size-8 sm:size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Notification"
            title="Notification"
            type="button"
          >
            <MI name="notifications" className="text-[16px] sm:text-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[var(--primary-500)] text-[9px] sm:text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" className="w-96 p-0 border-neutral-800 bg-neutral-900 max-h-[500px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-colors font-medium hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            // ✅ Show skeleton loading instead of spinner
            <div className="space-y-0 max-h-[400px] overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-neutral-800">
                  {/* Avatar skeleton */}
                  <div className="skel h-10 w-10 rounded-full flex-shrink-0" />

                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Name + message line */}
                    <div className="space-y-1">
                      <div className="skel h-4 w-full rounded" />
                      <div className="skel h-3 w-3/4 rounded" />
                    </div>

                    {/* Time line */}
                    <div className="skel h-3 w-1/2 rounded" />
                  </div>

                  {/* Icon + notification dot skeleton */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="skel h-5 w-5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
                <MI name="notifications_none" className="text-[22px] text-neutral-300" />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
              <p className="mt-1 text-xs text-neutral-400">Notifications will appear here when someone interacts with your content.</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => {
                // ✅ Show avatar from DB or fallback to AbstractProfile
                const displayName = notif.actorName || `${notif.actorAddress.slice(0, 6)}…${notif.actorAddress.slice(-4)}`;
                
                // ✅ Build message with target title - different format for video vs community
                let messageWithTarget: string;
                
                if (notif.targetType === "video") {
                  // VIDEO NOTIFICATIONS - Format: {actor} {action} video: {videoTitle}
                  if (notif.type === "video_like") {
                    // Video Like: {actor} liked your video: {videoTitle}
                    messageWithTarget = `liked your video: ${notif.targetTitle || "Unknown"}`;
                  } else if (notif.type === "video_comment") {
                    // Video Comment: {actor} commented on your video: "{commentSnippet}" : {isiComment}
                    const commentSnippet = notif.commentText ? notif.commentText.substring(0, 50) : "...";
                    messageWithTarget = `commented on your video: ${commentSnippet} : ${notif.commentText || ""}`;
                  } else if (notif.type === "video_purchase") {
                    // Video Purchase: {actor} purchased your video: {videoTitle}
                    messageWithTarget = `purchased your video: ${notif.targetTitle || "Unknown"}`;
                  } else {
                    messageWithTarget = notif.message;
                  }
                } else if (notif.targetType === "post") {
                  // COMMUNITY POST NOTIFICATIONS - Format: {actor} {action} post: {postTitle}
                  if (notif.type === "like") {
                    // Community Post Like: {actor} liked your post: {postTitle}
                    messageWithTarget = `liked your post: ${notif.targetTitle || "Unknown"} `;
                  } else if (notif.type === "reply") {
                    // Community Reply: {actor} replied to your post: {replySnippet} : {isiReply}
                    const replySnippet = notif.targetTitle ? notif.targetTitle.substring(0, 50) : "...";
                    messageWithTarget = `replied to your post: ${replySnippet} : ${notif.targetTitle || ""}`;
                  } else {
                    messageWithTarget = notif.message;
                  }
                } else if (notif.targetType === "reply") {
                  // COMMUNITY REPLY NOTIFICATIONS - Format: {actor} {action} reply: {replyContent}
                  if (notif.type === "like_reply") {
                    // Reply Like: {actor} liked your reply: {replyContent}
                    messageWithTarget = `liked your reply: ${notif.targetTitle || "Unknown"}`;
                  } else if (notif.type === "nested_reply") {
                    // Nested Reply: {actor} replied to your reply: {replySnippet} : {isiReply}
                    const replySnippet = notif.targetTitle ? notif.targetTitle.substring(0, 50) : "...";
                    messageWithTarget = `replied to your reply: ${replySnippet} : ${notif.targetTitle || ""}`;
                  } else {
                    messageWithTarget = notif.message;
                  }
                } else {
                  messageWithTarget = notif.message;
                }
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                    className={`
                      group relative flex items-start gap-3 px-4 py-3 border-b border-neutral-800 
                      hover:bg-neutral-800/70 cursor-pointer transition-all duration-200
                      ${!notif.isRead ? "bg-[var(--primary-500)]/5 border-l-2 border-l-[var(--primary-500)]" : "border-l-2 border-l-transparent"}
                    `}
                  >
                    {/* ✅ Avatar from DB or fallback to AbstractProfile */}
                    <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0 shadow-md">
                      {notif.actorAvatar ? (
                        // ✅ Show avatar from database
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={notif.actorAvatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // Fallback to AbstractProfile
                        <AbstractProfile
                          address={notif.actorAddress as `0x${string}`}
                          size="xs"
                          showTooltip={false}
                          className="!h-10 !w-10"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-200">
                            <span className={`font-semibold ${!notif.isRead ? "text-white" : ""}`}>
                              {displayName}
                            </span>{" "}
                            <span className={!notif.isRead ? "text-neutral-300" : "text-neutral-400"}>
                              {messageWithTarget}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-lg" title={notif.type}>
                            {getNotificationIcon(notif.type)}
                          </span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[var(--primary-500)] animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all shrink-0 cursor-pointer"
                      aria-label="Delete notification"
                    >
                      <MI name="close" className="text-[16px]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
