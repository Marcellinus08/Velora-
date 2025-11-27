"use client";

import { MI } from "./MI";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { AbstractProfile } from "@/components/abstract-profile";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface NotificationSheetProps {
  open: boolean;
  onClose: () => void;
  abstractId?: `0x${string}`;
}

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

export function NotificationSheet({ open, onClose, abstractId }: NotificationSheetProps) {
  const router = useRouter();
  const finalAbstractId = abstractId || getStoredAbstractAddress() || undefined;
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(finalAbstractId);

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

  const handleNotificationClick = async (
    id: string, 
    isRead: boolean,
    targetType: string,
    targetId: string,
    actorAddress: string,
    notifType: string
  ) => {
    // Mark as read jika belum
    if (!isRead) {
      try {
        await markAsRead(id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Close sheet
    onClose();

    // Navigate ke halaman terkait berdasarkan tipe notifikasi
    try {
      if (notifType === "follow") {
        router.push(`/profile?address=${actorAddress}`);
      } else if (targetType === "video") {
        router.push(`/video?id=${targetId}`);
      } else if (targetType === "post" || targetType === "reply") {
        router.push(`/community?postId=${targetId}`);
      } else if (targetType === "profile") {
        router.push(`/profile?address=${targetId}`);
      }
    } catch (error) {
      console.error("Failed to navigate:", error);
    }
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center justify-center text-neutral-100 hover:text-white transition-colors"
            aria-label="Close notifications"
          >
            <MI name="arrow_back" className="text-[24px]" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-100">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-colors font-medium cursor-pointer"
              >
                Mark all as read
              </button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20">
                <span className="text-xs font-semibold text-[var(--primary-500)]">{unreadCount} new</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto bg-neutral-900">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-neutral-800">
                <div className="skel h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="space-y-1">
                    <div className="skel h-4 w-full rounded" />
                    <div className="skel h-3 w-3/4 rounded" />
                  </div>
                  <div className="skel h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800/70">
              <MI name="notifications_none" className="text-[32px] text-neutral-300" />
            </div>
            <p className="mt-4 text-base font-medium text-neutral-200">No notifications yet</p>
            <p className="mt-2 text-sm text-neutral-400">Notifications will appear here when someone interacts with your content.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => {
              const displayName = notif.actorName || `${notif.actorAddress.slice(0, 6)}…${notif.actorAddress.slice(-4)}`;
              
              const hasActorInMessage = notif.message.includes(displayName);
              
              let messageWithTarget: string;
              
              if (notif.type === "follow" || hasActorInMessage) {
                messageWithTarget = notif.message;
              } else if (notif.targetType === "video") {
                if (notif.type === "video_like") {
                  messageWithTarget = `liked your video: ${notif.targetTitle || "Unknown"}`;
                } else if (notif.type === "video_comment") {
                  const commentSnippet = notif.commentText ? notif.commentText.substring(0, 50) : "...";
                  messageWithTarget = `commented on your video: ${commentSnippet}`;
                } else if (notif.type === "video_purchase") {
                  messageWithTarget = `purchased your video: ${notif.targetTitle || "Unknown"}`;
                } else {
                  messageWithTarget = notif.message;
                }
              } else if (notif.targetType === "post") {
                if (notif.type === "like") {
                  messageWithTarget = `liked your post: ${notif.targetTitle || "Unknown"}`;
                } else if (notif.type === "reply") {
                  const replySnippet = notif.targetTitle ? notif.targetTitle.substring(0, 50) : "...";
                  messageWithTarget = `replied to your post: ${replySnippet}`;
                } else {
                  messageWithTarget = notif.message;
                }
              } else if (notif.targetType === "reply") {
                if (notif.type === "like_reply") {
                  messageWithTarget = `liked your reply: ${notif.targetTitle || "Unknown"}`;
                } else if (notif.type === "nested_reply") {
                  const replySnippet = notif.targetTitle ? notif.targetTitle.substring(0, 50) : "...";
                  messageWithTarget = `replied to your reply: ${replySnippet}`;
                } else {
                  messageWithTarget = notif.message;
                }
              } else {
                messageWithTarget = notif.message;
              }
              
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    handleNotificationClick(
                      notif.id, 
                      notif.isRead, 
                      notif.targetType, 
                      notif.targetId, 
                      notif.actorAddress,
                      notif.type
                    );
                  }}
                  className={`
                    group relative flex items-start gap-3 px-4 py-3 border-b border-neutral-800 
                    active:bg-neutral-800/70 cursor-pointer transition-all duration-200
                    ${!notif.isRead ? "bg-[var(--primary-500)]/5" : ""}
                  `}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0 shadow-md">
                    {notif.actorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={notif.actorAvatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
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
                        <p className="text-sm text-neutral-200 leading-5">
                          {notif.type === "follow" || hasActorInMessage ? (
                            <>
                              <span className={`font-semibold ${!notif.isRead ? "text-white" : "text-neutral-100"}`}>
                                {displayName}
                              </span>{" "}
                              <span className={!notif.isRead ? "text-neutral-300" : "text-neutral-400"}>
                                {notif.type === "follow" ? "started following you" : messageWithTarget.replace(displayName, "").trim()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={`font-semibold ${!notif.isRead ? "text-white" : "text-neutral-100"}`}>
                                {displayName}
                              </span>{" "}
                              <span className={!notif.isRead ? "text-neutral-300" : "text-neutral-400"}>
                                {messageWithTarget}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-lg" title={notif.type}>
                            {getNotificationIcon(notif.type)}
                          </span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[var(--primary-500)]" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="text-neutral-500 hover:text-red-400 active:text-red-500 transition-colors p-1 cursor-pointer"
                          aria-label="Delete notification"
                        >
                          <MI name="close" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
