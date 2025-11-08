// src/components/skeletons/community-skeleton.tsx
"use client";

export function CommunityPostSkeleton() {
  return (
    <div className="skel rounded-lg border border-neutral-800/50 bg-neutral-900/30 p-4 shadow-lg shadow-black/50 max-sm:p-3 max-sm:rounded-md md:p-4 md:rounded-lg">
      <div className="flex gap-4 max-sm:gap-2.5 md:gap-3.5">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="skel h-12 w-12 rounded-full max-sm:h-8 max-sm:w-8 md:h-10 md:w-10" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3 max-sm:space-y-2 md:space-y-2.5">
          {/* Header line */}
          <div className="flex items-center gap-3 max-sm:gap-2 md:gap-2">
            <div className="skel h-4 w-32 rounded max-sm:h-3 max-sm:w-24 md:h-4 md:w-28" />
            <div className="skel h-3 w-24 rounded max-sm:h-2.5 max-sm:w-20 md:h-3 md:w-24" />
          </div>

          {/* Category badge */}
          <div className="skel h-6 w-20 rounded-full max-sm:h-5 max-sm:w-16 md:h-6 md:w-20" />

          {/* Title lines */}
          <div className="space-y-2 max-sm:space-y-1.5 md:space-y-2">
            <div className="skel h-4 w-full rounded max-sm:h-3.5 md:h-4" />
            <div className="skel h-4 w-5/6 rounded max-sm:h-3.5 md:h-4" />
          </div>

          {/* Content lines */}
          <div className="space-y-2 pt-2 max-sm:space-y-1.5 max-sm:pt-1.5 md:space-y-2 md:pt-2">
            <div className="skel h-3 w-full rounded max-sm:h-2.5 md:h-3" />
            <div className="skel h-3 w-4/5 rounded max-sm:h-2.5 md:h-3" />
            <div className="skel h-3 w-3/4 rounded max-sm:h-2.5 md:h-3" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center gap-4 pt-3 max-sm:gap-3 max-sm:pt-2 md:gap-4 md:pt-3">
            <div className="skel h-4 w-16 rounded max-sm:h-3 max-sm:w-14 md:h-4 md:w-16" />
            <div className="skel h-4 w-16 rounded max-sm:h-3 max-sm:w-14 md:h-4 md:w-16" />
            <div className="skel h-4 w-20 rounded max-sm:h-3 max-sm:w-16 md:h-4 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityPageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 max-sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommunityPostSkeleton key={i} />
      ))}
    </div>
  );
}
