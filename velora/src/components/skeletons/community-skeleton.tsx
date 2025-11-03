// src/components/skeletons/community-skeleton.tsx
"use client";

export function CommunityPostSkeleton() {
  return (
    <div className="skel rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 shadow-lg shadow-black/50">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="skel h-12 w-12 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header line */}
          <div className="flex items-center gap-3">
            <div className="skel h-4 w-32 rounded" />
            <div className="skel h-3 w-24 rounded" />
          </div>

          {/* Category badge */}
          <div className="skel h-6 w-20 rounded-full" />

          {/* Title lines */}
          <div className="space-y-2">
            <div className="skel h-4 w-full rounded" />
            <div className="skel h-4 w-5/6 rounded" />
          </div>

          {/* Content lines */}
          <div className="space-y-2 pt-2">
            <div className="skel h-3 w-full rounded" />
            <div className="skel h-3 w-4/5 rounded" />
            <div className="skel h-3 w-3/4 rounded" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center gap-4 pt-3">
            <div className="skel h-4 w-16 rounded" />
            <div className="skel h-4 w-16 rounded" />
            <div className="skel h-4 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityPageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommunityPostSkeleton key={i} />
      ))}
    </div>
  );
}
