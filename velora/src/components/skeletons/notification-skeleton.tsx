/**
 * Notification Skeleton Components
 * 
 * Used in NotificationsMenu popup for loading states
 * - NotificationRowSkeleton: Individual notification item skeleton
 * - NotificationListSkeleton: Full notification list skeleton
 */

/**
 * Single notification row skeleton
 * Displays: Avatar + text lines + icon + close button (hidden on skeleton)
 */
export function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-800">
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
  );
}

/**
 * Full notification list skeleton
 * Displays: Header + 5 notification rows
 */
export function NotificationListSkeleton() {
  return (
    <div className="w-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="skel h-4 w-24 rounded" />
        <div className="skel h-3 w-20 rounded" />
      </div>

      {/* Notification rows skeleton */}
      <div className="max-h-[400px] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Dropdown menu skeleton (used when menu first opens)
 * Shows loading animation instead of spinner
 */
export function NotificationMenuSkeleton() {
  return (
    <div className="w-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="skel h-4 w-24 rounded" />
      </div>

      {/* Content area with shimmer */}
      <div className="flex flex-col gap-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
