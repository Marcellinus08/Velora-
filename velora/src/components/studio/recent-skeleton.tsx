export function StudioRecentSkeleton() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
      {/* Header skeleton */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 p-4">
        <div className="flex items-center gap-3">
          {/* Title skeleton */}
          <div className="h-6 w-24 rounded-lg bg-neutral-700/60 skel" />

          {/* Tabs skeleton */}
          <div className="flex rounded-lg bg-neutral-800 p-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-md px-3 py-1 h-8 w-16 bg-neutral-700/50 skel"
                style={{ animationDelay: `${0.05 * i}s` }}
              />
            ))}
          </div>
        </div>

        {/* View all button skeleton */}
        <div className="h-8 w-24 rounded-full bg-neutral-700/50 skel" style={{ animationDelay: '0.15s' }} />
      </header>

      {/* Body with content skeletons */}
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-neutral-800/30 bg-neutral-800/20 p-3"
          >
            {/* Thumbnail skeleton */}
            <div className="h-16 w-24 rounded-lg bg-neutral-700/60 skel flex-shrink-0" style={{ animationDelay: `${0.08 * i}s` }} />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <div className="h-4 w-full rounded-lg bg-neutral-700/60 skel" style={{ animationDelay: `${0.08 * i + 0.05}s` }} />

              {/* Description skeleton */}
              <div className="h-3 w-3/4 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: `${0.08 * i + 0.1}s` }} />

              {/* Meta info skeleton */}
              <div className="flex gap-3 pt-1">
                <div className="h-3 w-16 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: `${0.08 * i + 0.15}s` }} />
                <div className="h-3 w-16 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: `${0.08 * i + 0.2}s` }} />
              </div>
            </div>

            {/* Action button skeleton */}
            <div className="h-8 w-20 rounded-full bg-neutral-700/50 skel flex-shrink-0" style={{ animationDelay: `${0.08 * i + 0.25}s` }} />
          </div>
        ))}
      </div>
    </section>
  );
}
