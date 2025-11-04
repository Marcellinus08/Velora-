"use client";

// Studio skeleton loading components
export function StudioHeaderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-neutral-800 rounded-lg" />
      
      {/* Subtitle skeleton */}
      <div className="h-4 w-72 bg-neutral-800 rounded-lg opacity-60" />
    </div>
  );
}

export function StudioStatsSkeleton() {
  return (
    <div className="relative mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800/30 bg-neutral-900/50 p-4 backdrop-blur-sm"
          >
            <div className="space-y-3">
              {/* Stat label skeleton */}
              <div className="h-4 w-24 bg-neutral-800 rounded-md" />
              
              {/* Stat value skeleton */}
              <div className="h-8 w-20 bg-neutral-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudioActionsSkeleton() {
  return (
    <div className="relative mt-6">
      <div className="flex flex-wrap gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 bg-neutral-800 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

export function StudioRecentPanelSkeleton() {
  return (
    <div className="relative mt-8">
      <div className="rounded-2xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/60 via-neutral-900/40 to-neutral-900/60 p-6 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Tabs skeleton */}
          <div className="flex gap-3 border-b border-neutral-800/30 pb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-20 bg-neutral-800 rounded-md"
              />
            ))}
          </div>

          {/* Content skeleton - video rows */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-800/30 bg-neutral-900/30 p-4 backdrop-blur-sm"
              >
                <div className="flex gap-4">
                  {/* Thumbnail skeleton */}
                  <div className="h-20 w-32 bg-neutral-800 rounded-lg flex-shrink-0" />
                  
                  {/* Content skeleton */}
                  <div className="flex-1 space-y-3">
                    {/* Title skeleton */}
                    <div className="h-4 w-2/3 bg-neutral-800 rounded-md" />
                    
                    {/* Stats skeleton */}
                    <div className="flex gap-4">
                      <div className="h-3 w-16 bg-neutral-800 rounded-sm" />
                      <div className="h-3 w-16 bg-neutral-800 rounded-sm" />
                      <div className="h-3 w-16 bg-neutral-800 rounded-sm" />
                    </div>
                    
                    {/* Description skeleton */}
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-neutral-800 rounded-sm" />
                      <div className="h-3 w-4/5 bg-neutral-800 rounded-sm opacity-60" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudioPageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
        <StudioHeaderSkeleton />
        <StudioStatsSkeleton />
        <StudioActionsSkeleton />
        <StudioRecentPanelSkeleton />
      </main>
    </div>
  );
}
