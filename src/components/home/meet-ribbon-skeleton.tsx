export function HomeMeetRibbonSkeleton() {
  return (
    <section className="mb-5">
      <div className="mt-4 flex gap-3 overflow-x-auto scroll-smooth pl-2 pr-2 md:pl-0 md:pr-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Title card skeleton */}
        <div className="min-w-[200px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 space-y-3">
          <div className="h-5 w-20 rounded-lg bg-neutral-700/60 skel" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.1s' }} />
            <div className="h-3 w-28 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="h-7 w-20 rounded-md bg-neutral-700/50 skel" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Coming Soon card skeleton - larger placeholder */}
        <div className="flex-1 min-w-[250px] rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-800/80 via-neutral-750/60 to-neutral-800/80 px-4 py-2 space-y-4">
          <div className="flex items-center gap-4">
            {/* Icon placeholder */}
            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-neutral-700/60 skel" />
            
            {/* Text placeholders */}
            <div className="flex-1 space-y-2">
              <div className="h-6 w-40 rounded-lg bg-neutral-700/60 skel" style={{ animationDelay: '0.1s' }} />
              <div className="h-4 w-52 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
