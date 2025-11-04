// src/components/skeletons/subscription-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman subscription
 * Menampilkan loading state yang match dengan design subscription video row
 */

/**
 * SubscriptionVideoRowSkeleton
 * Skeleton untuk satu subscription video row
 * Matches design dari SubscriptionVideoRow component
 */
export function SubscriptionVideoRowSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-4 shadow-lg shadow-black/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Thumbnail skeleton */}
          <div className="skel relative h-16 w-28 overflow-hidden rounded-md ring-1 ring-neutral-700/50" />

          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="skel h-4 w-48 rounded" />
            {/* Subtext skeleton */}
            <div className="skel h-3 w-32 rounded" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="skel h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

/**
 * SubscriptionRowsGridSkeleton
 * Skeleton untuk grid dari subscription video rows
 * Default: 3 rows untuk "Available" section
 */
export function SubscriptionRowsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SubscriptionVideoRowSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * SubscriptionPageSkeleton
 * Full page skeleton untuk subscription halaman
 * Menampilkan: Header + Available section + Completed section
 */
export function SubscriptionPageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      {/* Sidebar skeleton (optional - bisa di-skip jika sidebar already rendered) */}
      
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="skel h-8 w-64 rounded" />
          </div>

          {/* Available section skeleton */}
          <div className="flex flex-col gap-4">
            <div className="skel h-6 w-48 rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SubscriptionVideoRowSkeleton key={`available-${i}`} />
              ))}
            </div>
          </div>

          {/* Completed section skeleton */}
          <div className="flex flex-col gap-4">
            <div className="skel h-6 w-48 rounded" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <SubscriptionVideoRowSkeleton key={`completed-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

