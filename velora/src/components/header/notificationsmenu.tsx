"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MI } from "./MI";
import { useNotifications } from "@/hooks/use-notifications";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { AbstractProfile } from "@/components/abstract-profile";

export default function NotificationsMenu() {
  const { address } = useAccount();
  const abstractId = address?.toLowerCase();

  console.log("[NotificationsMenu] Current user address:", { address, abstractId });

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
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    console.log("[NotificationsMenu] Clicked notification:", { id, isRead });
    if (!isRead) {
      try {
        await markAsRead(id);
        console.log("[NotificationsMenu] Marked as read successfully");
      } catch (error) {
        console.error("[NotificationsMenu] Failed to mark as read:", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log("[NotificationsMenu] Mark all as read clicked");
    try {
      await markAllAsRead();
      console.log("[NotificationsMenu] Marked all as read successfully");
    } catch (error) {
      console.error("[NotificationsMenu] Failed to mark all as read:", error);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex size-10 cursor-pointer border border-[var(--primary-500)] items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40"
            aria-label="Notification"
            title="Notification"
            type="button"
          >
            <MI name="notifications" className="text-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary-500)] text-[10px] font-bold">
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
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-500)]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70">
                <MI name="notifications_none" className="text-[22px] text-neutral-300" />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-200">No notifications yet</p>
              <p className="mt-1 text-xs text-neutral-400">Notifications will appear here when someone interacts with your posts.</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                  className={`
                    group relative flex items-start gap-3 px-4 py-3 border-b border-neutral-800 
                    hover:bg-neutral-800/70 cursor-pointer transition-all duration-200
                    ${!notif.isRead ? "bg-[var(--primary-500)]/5 border-l-2 border-l-[var(--primary-500)]" : "border-l-2 border-l-transparent"}
                  `}
                >
                  <AbstractProfile
                    address={notif.actorAddress as `0x${string}`}
                    size="md"
                    className="shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-200">
                          <span className={`font-semibold ${!notif.isRead ? "text-white" : ""}`}>
                            {notif.actorName || "Someone"}
                          </span>{" "}
                          <span className={!notif.isRead ? "text-neutral-300" : "text-neutral-400"}>
                            {notif.message}
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
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
