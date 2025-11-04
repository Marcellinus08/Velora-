export function CardsGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* Section title skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 rounded-lg bg-neutral-700/60 skel" />
        <div className="h-5 w-96 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.1s' }} />
      </div>

      {/* Grid of card skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="group rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden hover:border-neutral-700 transition-all duration-300"
          >
            {/* Thumbnail skeleton */}
            <div className="relative h-40 w-full bg-neutral-800 overflow-hidden skel" style={{ animationDelay: `${0.05 * i}s` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800/50" />
            </div>

            {/* Content section */}
            <div className="p-4 space-y-3">
              {/* Title skeleton */}
              <div className="h-5 w-full rounded-lg bg-neutral-700/60 skel" style={{ animationDelay: `${0.05 * i + 0.1}s` }} />
              <div className="h-5 w-4/5 rounded-lg bg-neutral-700/60 skel" style={{ animationDelay: `${0.05 * i + 0.15}s` }} />

              {/* Description skeletons */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: `${0.05 * i + 0.2}s` }} />
                <div className="h-4 w-3/4 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: `${0.05 * i + 0.25}s` }} />
              </div>

              {/* Footer with creator and button */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                {/* Creator info skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-neutral-700/60 skel" style={{ animationDelay: `${0.05 * i + 0.3}s` }} />
                  <div className="h-4 w-24 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: `${0.05 * i + 0.35}s` }} />
                </div>

                {/* Button skeleton */}
                <div className="h-8 w-20 rounded-full bg-neutral-700/60 skel" style={{ animationDelay: `${0.05 * i + 0.4}s` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
