"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2, X } from "lucide-react";
import { useFollowNotifications } from "@/hooks/use-follow-notifications";
import { useRouter } from "next/navigation";

interface FollowNotificationItemProps {
  userAddr?: string;
  maxItems?: number;
}

/**
 * Component untuk display follow notifications
 * Bisa digunakan di notification center atau sidebar
 */
export function FollowNotificationsList({
  userAddr,
  maxItems = 5,
}: FollowNotificationItemProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
  } = useFollowNotifications({
    userAddr,
    unreadOnly: false,
    pollInterval: 30000,
  });

  const [me, setMe] = useState<string | null>(null);

  // Get current user address
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("wagmi.store") ||
        localStorage.getItem("abstract:session") ||
        localStorage.getItem("abstract_id") ||
        localStorage.getItem("wallet");

      if (raw) {
        const m = raw.match(/0x[a-fA-F0-9]{40}/);
        if (m) setMe(m[0].toLowerCase());
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!me) return null;

  const displayNotifications = notifications.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {/* Header dengan unread count */}
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-semibold text-neutral-100">
          Follow Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Loading state */}
      {isLoading && notifications.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="animate-spin text-neutral-400" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-4 text-sm text-neutral-400">
          No follow notifications yet
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-1.5">
        {displayNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={async () => {
              // Mark as read jika belum
              if (!notif.is_read) {
                await markAsRead(notif.id);
              }
              // Navigate ke profile orang yang follow
              router.push(`/profile?address=${notif.actor_addr}`);
            }}
            className={`
              p-3 rounded-lg border transition-all duration-200 cursor-pointer
              ${
                notif.is_read
                  ? "border-neutral-700 bg-neutral-900/40"
                  : "border-violet-700/50 bg-violet-900/20"
              }
              hover:border-neutral-600 hover:bg-neutral-800/60
            `}
          >
            <div className="flex items-start gap-2">
              {/* Avatar */}
              <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-neutral-800">
                {notif.actor_profile?.avatar_url ? (
                  <img
                    src={notif.actor_profile.avatar_url}
                    alt={notif.actor_profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Heart size={16} className="text-violet-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-100 line-clamp-2">
                  <span className="font-semibold">
                    {notif.actor_profile?.username || "Someone"}
                  </span>
                  {" started following you"}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {new Date(notif.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                    title="Mark as read"
                  >
                    <div className="h-2 w-2 rounded-full bg-violet-500" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400 hover:text-red-400"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      {notifications.length > maxItems && (
        <div className="text-center pt-1">
          <a
            href="/notifications"
            className="text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            View all {notifications.length} notifications
          </a>
        </div>
      )}
    </div>
  );
}

export default FollowNotificationsList;
