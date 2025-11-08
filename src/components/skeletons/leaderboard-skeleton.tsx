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
      <td className="whitespace-nowrap py-5 pl-6 pr-3">
        <div className="skel inline-flex h-10 w-10 rounded-lg" />
      </td>

      {/* User info */}
      <td className="px-3 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="skel relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-neutral-700/50" />

          {/* Name */}
          <div className="flex-1 space-y-2">
            <div className="skel h-4 w-40 rounded" />
            <div className="skel h-3 w-24 rounded" />
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="whitespace-nowrap px-3 py-5 pr-6 text-right">
        <div className="skel h-5 w-20 rounded" />
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
    <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/30 shadow-lg shadow-black/50">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-neutral-800/50 bg-neutral-800/30">
            <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Rank
            </th>
            <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">
              User
            </th>
            <th className="px-3 py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400">
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
    <div className="flex items-center justify-between rounded-xl border border-neutral-800/50 bg-neutral-900/30 px-6 py-4 shadow-lg shadow-black/50">
      <div className="flex items-center gap-4 flex-1">
        {/* Avatar */}
        <div className="skel relative h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-700/50" />

        {/* Name and subtitle */}
        <div className="flex-1 space-y-2">
          <div className="skel h-5 w-40 rounded" />
          <div className="skel h-3 w-32 rounded" />
        </div>
      </div>

      {/* Rank and Score */}
      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="skel h-3 w-12 rounded mb-2" />
          <div className="skel h-6 w-16 rounded" />
        </div>
        <div className="text-right">
          <div className="skel h-3 w-12 rounded mb-2" />
          <div className="skel h-6 w-16 rounded" />
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
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="skel h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <div className="skel h-6 w-40 rounded" />
                <div className="skel h-4 w-56 rounded" />
              </div>
            </div>
            <div className="skel h-5 w-24 rounded" />
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

