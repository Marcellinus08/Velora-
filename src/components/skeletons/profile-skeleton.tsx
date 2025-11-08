// src/components/skeletons/profile-skeleton.tsx
"use client";

/**
 * Skeleton components untuk halaman profile
 * Menampilkan loading state yang match dengan design profile page
 */

/**
 * ProfileHeaderSkeleton
 * Skeleton untuk profile header (avatar, name, wallet, bio)
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 shadow-lg shadow-black/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        {/* Avatar skeleton */}
        <div className="skel h-24 w-24 rounded-full ring-2 ring-neutral-700" />

        {/* Header info skeleton */}
        <div className="flex-1 space-y-3">
          {/* Name and wallet */}
          <div className="space-y-2">
            <div className="skel h-7 w-48 rounded" style={{ animationDelay: '0.05s' }} />
            <div className="skel h-4 w-32 rounded" style={{ animationDelay: '0.1s' }} />
          </div>

          {/* Bio */}
          <div className="space-y-2 pt-2">
            <div className="skel h-4 w-full rounded" style={{ animationDelay: '0.15s' }} />
            <div className="skel h-4 w-5/6 rounded" style={{ animationDelay: '0.2s' }} />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-3 pt-2">
            <div className="skel h-10 w-32 rounded-full" style={{ animationDelay: '0.25s' }} />
            <div className="skel h-10 w-32 rounded-full" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileStatsCardSkeleton
 * Skeleton untuk stats dan rank card - match dengan 5 columns (Followers, Following, Profit, Points, Rank)
 */
export function ProfileStatsCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center"
        >
          {/* Label skeleton */}
          <div className="skel h-3 w-20 rounded mx-auto" style={{ animationDelay: `${0.05 * i}s` }} />
          
          {/* Value skeleton */}
          <div className="skel h-6 w-16 rounded mx-auto mt-2" style={{ animationDelay: `${0.05 * i + 0.05}s` }} />
        </div>
      ))}
    </div>
  );
}

/**
 * ProfileTabsSkeleton
 * Skeleton untuk tabs (History/Activity)
 */
export function ProfileTabsSkeleton() {
  return (
    <div className="border-b border-neutral-800 pb-4">
      <div className="flex gap-3">
        {/* History tab skeleton */}
        <div className="skel h-10 w-20 rounded-full" />
        
        {/* Activity tab skeleton */}
        <div className="skel h-10 w-20 rounded-full" style={{ animationDelay: '0.05s' }} />
      </div>
    </div>
  );
}

/**
 * ProfileFilterBarSkeleton
 * Skeleton untuk filter dan search bar
 */
export function ProfileFilterBarSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
      {/* Filter select */}
      <div className="skel h-10 w-40 rounded-md" />

      {/* Search and sort */}
      <div className="flex gap-3">
        <div className="skel h-10 w-48 rounded-full" style={{ animationDelay: '0.05s' }} />
        <div className="skel h-10 w-32 rounded-md" style={{ animationDelay: '0.1s' }} />
      </div>
    </div>
  );
}

/**
 * ProfileStatsSummarySkeleton
 * Skeleton untuk stats summary cards (History/Activity)
 */
export function ProfileStatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-neutral-800/50 bg-neutral-800/50 p-4 text-center"
        >
          {/* Label skeleton */}
          <div className="skel h-3 w-20 rounded mx-auto" style={{ animationDelay: `${0.05 * i}s` }} />
          
          {/* Value skeleton */}
          <div className="skel h-6 w-16 rounded mx-auto mt-2" style={{ animationDelay: `${0.05 * i + 0.05}s` }} />
        </div>
      ))}
    </div>
  );
}

/**
 * ProfileTableRowSkeleton
 * Skeleton untuk satu row dalam history/activity table
 */
export function ProfileTableRowSkeleton() {
  return (
    <tr className="border-b border-neutral-800/30">
      {/* Content column */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="skel h-12 w-20 rounded" />
          <div className="flex-1 space-y-2">
            <div className="skel h-4 w-40 rounded" />
            <div className="skel h-3 w-24 rounded" />
          </div>
        </div>
      </td>
      
      {/* Type column */}
      <td className="px-4 py-4">
        <div className="skel h-6 w-16 rounded-full" />
      </td>
      
      {/* Amount/Price column */}
      <td className="px-4 py-4">
        <div className="skel h-5 w-20 rounded" />
      </td>
      
      {/* Status column */}
      <td className="px-4 py-4">
        <div className="skel h-6 w-20 rounded-full" />
      </td>
      
      {/* Date column */}
      <td className="px-4 py-4">
        <div className="skel h-4 w-32 rounded" />
      </td>
    </tr>
  );
}

/**
 * ProfileTableSkeleton
 * Skeleton untuk history/activity table
 */
export function ProfileTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-lg shadow-black/50">
      <table className="w-full">
        <thead className="border-b border-neutral-800 bg-neutral-900/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Content
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {Array.from({ length: count }).map((_, i) => (
            <ProfileTableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * ProfilePaginationSkeleton
 * Skeleton untuk pagination controls
 */
export function ProfilePaginationSkeleton() {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="skel h-10 w-48 rounded-md" />
      <div className="flex gap-2">
        <div className="skel h-10 w-16 rounded-md" />
        <div className="skel h-10 w-20 rounded-md" />
        <div className="skel h-10 w-16 rounded-md" />
      </div>
    </div>
  );
}

/**
 * ProfilePageSkeleton
 * Full page skeleton untuk profile halaman
 */
export function ProfilePageSkeleton() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <ProfileHeaderSkeleton />

          {/* Stats and rank skeleton */}
          <div>
            <ProfileStatsCardSkeleton />
          </div>

          {/* Tabs and content */}
          <div className="space-y-4">
            {/* Tabs skeleton */}
            <ProfileTabsSkeleton />

            {/* Filter bar skeleton */}
            <ProfileFilterBarSkeleton />

            {/* Stats summary skeleton */}
            <ProfileStatsSummarySkeleton />

            {/* Table skeleton */}
            <ProfileTableSkeleton count={5} />

            {/* Pagination skeleton */}
            <ProfilePaginationSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
