// src/components/skeletons/meet-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman meet
 * Menampilkan loading state yang match dengan design meet cards
 */

// Shimmer animation CSS
const shimmerCSS = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  .shimmer {
    background-color: #1f2937;
    background-image: linear-gradient(
      90deg,
      rgba(107, 114, 128, 0) 0,
      rgba(107, 114, 128, 0.2) 20%,
      rgba(107, 114, 128, 0.5) 60%,
      rgba(107, 114, 128, 0)
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;

/**
 * MeetCardSkeleton
 * Skeleton untuk satu meet card/creator
 * Matches design dari MeetCard component
 */
export function MeetCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 overflow-hidden shadow-lg shadow-black/50">
      {/* Avatar skeleton */}
      <div className="shimmer w-full h-40 rounded-t-lg" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Name skeleton */}
        <div className="shimmer h-5 w-32 rounded" />

        {/* Handle skeleton */}
        <div className="shimmer h-4 w-24 rounded" />

        {/* Pricing info skeleton */}
        <div className="space-y-2">
          <div className="shimmer h-4 w-40 rounded" />
          <div className="shimmer h-4 w-40 rounded" />
        </div>

        {/* Button skeleton */}
        <div className="pt-2">
          <div className="shimmer h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * MeetCreatorsGridSkeleton
 * Skeleton grid untuk creators
 * Default: 6 cards (responsive grid)
 */
export function MeetCreatorsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{shimmerCSS}</style>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <MeetCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

/**
 * MeetOrderRowSkeleton
 * Skeleton untuk order row dalam orders tab
 */
export function MeetOrderRowSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="shimmer h-5 w-40 rounded" />
        </div>
        <div className="shimmer h-5 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * MeetOrdersListSkeleton
 * Skeleton untuk orders list
 * Default: 3 rows
 */
export function MeetOrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      <style>{shimmerCSS}</style>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <MeetOrderRowSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

/**
 * MeetPageSkeleton
 * Full page skeleton untuk meet halaman
 * Menampilkan: Header + Tabs + Grid skeleton
 */
export function MeetPageSkeleton() {
  return (
    <>
      <style>{shimmerCSS}</style>
      <div className="flex h-full">
        {/* Main content area */}
        <main className="flex-1 px-6 py-8">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="shimmer h-8 w-64 rounded mb-2" />
            <div className="shimmer h-4 w-96 rounded" />
          </div>

          {/* Tabs skeleton */}
          <div className="border-b border-neutral-800 mb-6">
            <div className="flex items-center gap-4">
              <div className="shimmer h-6 w-20 rounded" />
              <div className="shimmer h-6 w-20 rounded" />
              <div className="shimmer h-6 w-20 rounded" />
              <div className="shimmer h-6 w-20 rounded" />
            </div>
          </div>

          {/* Content skeleton - Grid */}
          <MeetCreatorsGridSkeleton count={6} />
        </main>
      </div>
    </>
  );
}
