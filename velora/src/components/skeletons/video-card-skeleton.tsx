/**
 * VideoCardSkeleton - Skeleton loader matching VideoCard design
 * Used during lazy loading and initial page load
 */

export function VideoCardSkeleton() {
  return (
    <div className="group flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 shadow-lg shadow-black/50">
      {/* Thumbnail skeleton */}
      <div className="relative w-full overflow-hidden rounded-t-xl">
        <div className="skel aspect-video w-full rounded-t-xl" />
        
        {/* Points badge skeleton */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5">
          <div className="skel h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Info section skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-3 pb-4">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="skel h-4 w-3/4 rounded" />
          <div className="skel h-3 w-1/3 rounded" />
        </div>

        {/* Author skeleton */}
        <div className="flex items-center gap-2 mt-2">
          <div className="skel h-6 w-6 rounded-full" />
          <div className="skel h-3 w-24 rounded" />
        </div>

        {/* Price and button skeleton */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="skel h-5 w-16 rounded" />
          <div className="skel h-9 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * VideoCardsGridSkeleton - Full grid skeleton for initial load
 */
export function VideoCardsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="skel h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <div className="skel h-6 w-40 rounded" />
              <div className="skel h-4 w-56 rounded" />
            </div>
          </div>
          <div className="skel h-8 w-32 rounded-full" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8">
        {Array.from({ length: count }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
