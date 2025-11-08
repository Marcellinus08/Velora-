// src/components/skeletons/meet-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman meet
 * Menampilkan loading state yang match dengan design meet cards
 */

/**
 * MeetCardSkeleton
 * Skeleton untuk satu meet card/creator
 * Matches design dari MeetCard component (p-5, border, pricing grid, button)
 */
export function MeetCardSkeleton() {
  return (
    <div className="skel rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      {/* Avatar + name + wallet */}
      <div className="mb-4 flex items-center gap-3">
        <div className="skel h-12 w-12 rounded-full ring-1 ring-neutral-700" />
        <div className="min-w-0 flex-1">
          <div className="skel h-4 w-32 rounded" />
          <div className="skel mt-2 h-3 w-24 rounded" />
        </div>
      </div>

      {/* Pricing grid (2 columns: Voice + Video) */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="skel rounded-lg border border-neutral-800 p-3">
          <div className="skel h-3 w-12 rounded" />
          <div className="skel mt-2 h-4 w-20 rounded" />
        </div>
        <div className="skel rounded-lg border border-neutral-800 p-3">
          <div className="skel h-3 w-12 rounded" />
          <div className="skel mt-2 h-4 w-20 rounded" />
        </div>
      </div>

      {/* Booking button */}
      <div className="skel h-9 w-full rounded-full" />
    </div>
  );
}

/**
 * MeetCreatorsGridSkeleton
 * Skeleton grid untuk creators
 * Default: 9 cards (responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop)
 */
export function MeetCreatorsGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MeetCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * MeetOrderRowSkeleton
 * Skeleton untuk order row dalam orders tab
 */
export function MeetOrderRowSkeleton() {
  return (
    <div className="skel rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="skel h-5 w-40 rounded" />
        </div>
        <div className="skel h-5 w-24 rounded" />
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
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MeetOrderRowSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * MeetPageSkeleton
 * Full page skeleton untuk meet halaman
 * Menampilkan: Header + Tabs + Grid skeleton
 */
export function MeetPageSkeleton() {
  return (
    <div className="flex h-full">
      {/* Main content area */}
      <main className="flex-1 px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="skel h-8 w-64 rounded mb-2" />
          <div className="skel h-4 w-96 rounded" />
        </div>

        {/* Tabs skeleton */}
        <div className="border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="skel h-6 w-20 rounded" />
            <div className="skel h-6 w-20 rounded" />
            <div className="skel h-6 w-20 rounded" />
            <div className="skel h-6 w-20 rounded" />
          </div>
        </div>

        {/* Content skeleton - Grid */}
        <MeetCreatorsGridSkeleton count={9} />
      </main>
    </div>
  );
}
