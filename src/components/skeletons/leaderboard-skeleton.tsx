// src/components/skeletons/leaderboard-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman leaderboard
 * Menampilkan loading state yang match dengan design leaderboard table
 */

/**
 * LeaderboardRowSkeleton
 * Skeleton untuk satu leaderboard table row
 * Matches design dari leaderboard table
 */
export function LeaderboardRowSkeleton() {
  return (
    <tr className="border-b border-neutral-800/30 hover:bg-neutral-800/40">
      {/* Rank */}
      <td className="whitespace-nowrap py-5 pl-6 pr-3 max-sm:py-2.5 max-sm:pl-3 max-sm:pr-1.5">
        <div className="skel inline-flex h-10 w-10 rounded-lg max-sm:h-6 max-sm:w-6" />
      </td>

      {/* User info */}
      <td className="px-3 py-5 max-sm:px-2 max-sm:py-2.5">
        <div className="flex items-center gap-4 max-sm:gap-2">
          {/* Avatar */}
          <div className="skel relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-neutral-700/50 flex-shrink-0 max-sm:h-8 max-sm:w-8 max-sm:ring-1" />

          {/* Name */}
          <div className="flex-1 space-y-2 max-sm:space-y-1">
            <div className="skel h-4 w-40 rounded max-sm:h-3 max-sm:w-24" />
            <div className="skel h-3 w-24 rounded max-sm:hidden" />
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="whitespace-nowrap px-3 py-5 pr-6 text-right max-sm:px-2 max-sm:py-2.5 max-sm:pr-3">
        <div className="skel h-5 w-20 rounded max-sm:h-3 max-sm:w-12" />
      </td>
    </tr>
  );
}

/**
 * LeaderboardTableSkeleton
 * Skeleton untuk leaderboard table dengan multiple rows
 * Default: 8 rows
 */
export function LeaderboardTableSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/30 shadow-lg shadow-black/50 max-sm:rounded-lg">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-neutral-800/50 bg-neutral-800/30">
            <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 max-sm:py-2 max-sm:pl-3 max-sm:pr-2 max-sm:text-[9px]">
              Rank
            </th>
            <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 max-sm:py-2 max-sm:px-2 max-sm:text-[9px]">
              User
            </th>
            <th className="px-3 py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400 max-sm:py-2 max-sm:px-2 max-sm:pr-3 max-sm:text-[9px]">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/30">
          {Array.from({ length: count }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CurrentUserCardSkeleton
 * Skeleton untuk current user card
 */
export function CurrentUserCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800/50 bg-neutral-900/30 px-6 py-4 shadow-lg shadow-black/50 max-sm:px-3 max-sm:py-2.5 max-sm:rounded-lg">
      <div className="flex items-center gap-4 flex-1 min-w-0 max-sm:gap-2">
        {/* Avatar */}
        <div className="skel relative h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-700/50 flex-shrink-0 max-sm:h-8 max-sm:w-8 max-sm:border" />

        {/* Name and subtitle */}
        <div className="flex-1 space-y-2 min-w-0 max-sm:space-y-1">
          <div className="skel h-5 w-40 rounded max-sm:h-3 max-sm:w-24" />
          <div className="skel h-3 w-32 rounded max-sm:h-2.5 max-sm:w-20" />
        </div>
      </div>

      {/* Rank and Score */}
      <div className="flex items-center gap-8 flex-shrink-0 max-sm:gap-2.5">
        <div className="text-right">
          <div className="skel h-3 w-12 rounded mb-2 max-sm:h-2 max-sm:w-8 max-sm:mb-1" />
          <div className="skel h-6 w-16 rounded max-sm:h-4 max-sm:w-10" />
        </div>
        <div className="text-right">
          <div className="skel h-3 w-12 rounded mb-2 max-sm:h-2 max-sm:w-8 max-sm:mb-1" />
          <div className="skel h-6 w-16 rounded max-sm:h-4 max-sm:w-10" />
        </div>
      </div>
    </div>
  );
}

/**
 * LeaderboardPageSkeleton
 * Full page skeleton untuk leaderboard
 */
export function LeaderboardPageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-sm:px-3 max-sm:py-3">
        <div className="flex flex-col gap-6 max-sm:gap-4">
          {/* Header skeleton */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between max-sm:gap-2.5">
            <div className="flex items-center gap-3 max-sm:gap-2">
              <div className="skel h-12 w-12 rounded-lg max-sm:h-9 max-sm:w-9" />
              <div className="space-y-2 max-sm:space-y-1">
                <div className="skel h-6 w-40 rounded max-sm:h-4 max-sm:w-32" />
                <div className="skel h-4 w-56 rounded max-sm:h-3 max-sm:w-40" />
              </div>
            </div>
            <div className="skel h-5 w-24 rounded max-sm:h-3 max-sm:w-20" />
          </div>

          {/* Current user card skeleton */}
          <CurrentUserCardSkeleton />

          {/* Table skeleton */}
          <LeaderboardTableSkeleton count={8} />
        </div>
      </main>
    </div>
  );
}

