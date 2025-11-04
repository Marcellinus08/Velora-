// src/components/skeletons/community-skeleton.tsx
"use client";

export function CommunityPostSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 shadow-lg shadow-black/50 animate-pulse">
      <div className="flex gap-4">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-neutral-800/50 shimmer" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header line */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-neutral-800/50 rounded shimmer" />
            <div className="h-3 w-24 bg-neutral-800/50 rounded shimmer" />
          </div>

          {/* Category badge */}
          <div className="h-6 w-20 bg-neutral-800/50 rounded-full shimmer" />

          {/* Title lines */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-neutral-800/50 rounded shimmer" />
            <div className="h-4 w-5/6 bg-neutral-800/50 rounded shimmer" />
          </div>

          {/* Content lines */}
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-neutral-800/50 rounded shimmer" />
            <div className="h-3 w-4/5 bg-neutral-800/50 rounded shimmer" />
            <div className="h-3 w-3/4 bg-neutral-800/50 rounded shimmer" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center gap-4 pt-3">
            <div className="h-4 w-16 bg-neutral-800/50 rounded shimmer" />
            <div className="h-4 w-16 bg-neutral-800/50 rounded shimmer" />
            <div className="h-4 w-20 bg-neutral-800/50 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityPageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-8 w-64 bg-neutral-800/50 rounded shimmer" />
        <div className="h-10 w-40 bg-neutral-800/50 rounded-full shimmer" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-neutral-800/50 rounded shimmer" />
        ))}
      </div>

      {/* Posts skeleton */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CommunityPostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
