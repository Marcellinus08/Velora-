/**
 * Skeleton loaders untuk berbagai komponen home
 */

export function CarouselSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      <div className="aspect-video w-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-shimmer" />
      
      {/* Navigation dots skeleton */}
      <div className="flex items-center justify-center gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-neutral-700/50 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-32 rounded bg-neutral-800/60 animate-pulse" />
      </div>

      {/* Categories grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-neutral-800/60 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeMeetRibbonSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-6 w-40 rounded bg-neutral-800/60 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-neutral-800/60 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-neutral-800/60 animate-pulse" />
        </div>
        <div className="h-20 w-32 rounded-lg bg-neutral-800/60 animate-pulse flex-shrink-0" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Carousel skeleton */}
      <div className="relative mb-8 w-full animate-in fade-in duration-700">
        <CarouselSkeleton />
      </div>

      {/* Meet section skeleton */}
      <div className="relative mb-8 animate-in slide-in-from-left duration-700" style={{ animationDelay: '200ms' }}>
        <HomeMeetRibbonSkeleton />
      </div>

      {/* Categories section skeleton */}
      <div className="relative animate-in slide-in-from-right duration-700" style={{ animationDelay: '400ms' }}>
        <CategoriesSkeleton />
      </div>

      {/* Cards grid skeleton */}
      <div className="relative animate-in fade-in duration-1000" style={{ animationDelay: '600ms' }}>
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 rounded bg-neutral-800/60 animate-pulse" />
                <div className="h-4 w-56 rounded bg-neutral-800/60 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-32 rounded-full bg-neutral-800/60 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse"
            >
              <div className="aspect-video w-full bg-neutral-800/60 rounded-t-xl animate-shimmer" />
              <div className="flex flex-1 flex-col gap-2 p-3 pb-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-neutral-800/60" />
                  <div className="h-3 w-1/3 rounded bg-neutral-800/60" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-6 w-6 rounded-full bg-neutral-800/60" />
                  <div className="h-3 w-24 rounded bg-neutral-800/60" />
                </div>
                <div className="mt-auto flex items-end justify-between pt-2">
                  <div className="h-5 w-16 rounded bg-neutral-800/60" />
                  <div className="h-9 w-20 rounded-full bg-neutral-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
