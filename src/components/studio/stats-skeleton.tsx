export function StudioStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="group relative rounded-2xl border border-neutral-800/50 bg-neutral-900/60 p-6 backdrop-blur-sm"
        >
          {/* Animated gradient overlay skeleton */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-800/0 to-neutral-700/0 opacity-0" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              {/* Label skeleton */}
              <div className="h-4 w-32 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: `${0.05 * i}s` }} />

              {/* Value skeleton */}
              <div className="mt-2 h-8 w-40 rounded-lg bg-neutral-700/60 skel" style={{ animationDelay: `${0.05 * i + 0.05}s` }} />

              {/* Secondary info skeleton */}
              <div className="mt-3 h-3 w-48 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: `${0.05 * i + 0.1}s` }} />
            </div>

            {/* Icon placeholder skeleton */}
            <div className="w-10 h-10 rounded-lg bg-neutral-700/50 skel ml-4 flex-shrink-0" style={{ animationDelay: `${0.05 * i + 0.15}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
