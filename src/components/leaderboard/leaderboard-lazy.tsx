// src/components/leaderboard/leaderboard-lazy.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LeaderboardTableSkeleton } from "@/components/skeletons/leaderboard-skeleton";
import { LeaderboardPagination } from "@/components/leaderboard/leaderboard-pagination";
import { AbstractProfile } from "@/components/abstract-profile";

interface LeaderboardUser {
  user_addr: string;
  total_points: number;
  username?: string;
  avatar_url?: string;
}

interface TableEntry {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatarUrl?: string;
  avatarNode: React.ReactNode;
}

interface LeaderboardLazyProps {
  allEntries: LeaderboardUser[];
  isLoading: boolean;
  onUserClick: (handle: string) => void;
  currentUserAddress?: string;
}

const ITEMS_PER_PAGE_DEFAULT = 10;

export function LeaderboardLazy({ allEntries, isLoading, onUserClick, currentUserAddress }: LeaderboardLazyProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);

  // Transform LeaderboardUser[] to TableEntry[] with ranks (memoized to prevent re-creation)
  const transformedEntries = useMemo(
    () =>
      allEntries.map((user, index) => ({
        rank: index + 1,
        name: user.username || user.user_addr.slice(0, 10),
        handle: user.user_addr,
        score: user.total_points,
        avatarUrl: user.avatar_url,
        avatarNode: user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <AbstractProfile address={user.user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
        ),
      })),
    [allEntries]
  );

  // Calculate pagination
  const totalPages = Math.ceil(transformedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = transformedEntries.slice(startIndex, endIndex);

  // Reset ke halaman 1 ketika data atau items per page berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [transformedEntries.length, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
  };

  // Format number untuk display
  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  if (isLoading) {
    return <LeaderboardTableSkeleton count={8} />;
  }

  if (paginatedItems.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/30">
        <div className="py-16 text-center text-neutral-400">
          <p>No leaderboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/30 max-sm:rounded-lg">
      {/* Table */}
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
          {paginatedItems.map((e) => {
            const isCurrentUser = currentUserAddress && e.handle.toLowerCase() === currentUserAddress.toLowerCase();
            const isTopThree = e.rank <= 3;

            return (
              <tr
                key={e.rank}
                className={`cursor-pointer transition-colors duration-200 ${
                  isCurrentUser
                    ? "bg-purple-900/20 hover:bg-purple-900/30"
                    : "hover:bg-neutral-800/40"
                }`}
                onClick={() => onUserClick(e.handle)}
              >
                <td className="whitespace-nowrap py-5 pl-6 pr-3 max-sm:py-2.5 max-sm:pl-3 max-sm:pr-1.5">
                  {isTopThree ? (
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800/80 text-base font-bold text-neutral-200 max-sm:h-6 max-sm:w-6 max-sm:text-[11px]">
                      {e.rank}
                    </div>
                  ) : (
                    <div className="inline-flex h-10 w-10 items-center justify-center text-base font-bold text-neutral-400 max-sm:h-6 max-sm:w-6 max-sm:text-[11px]">
                      {e.rank}
                    </div>
                  )}
                </td>
                <td className="px-3 py-5 max-sm:px-2 max-sm:py-2.5">
                  <div className="flex items-center gap-4 max-sm:gap-2">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-800 max-sm:h-8 max-sm:w-8">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {e.avatarNode}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-neutral-50 max-sm:text-xs max-sm:gap-1.5">
                        <span>{e.name}</span>
                        {isCurrentUser && (
                          <span className="flex-shrink-0 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30 max-sm:px-1.5 max-sm:py-0.5 max-sm:text-[8px]">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-5 pr-6 text-right max-sm:px-2 max-sm:py-2.5 max-sm:pr-3">
                  <div className="inline-flex items-center gap-2 text-yellow-400 max-sm:gap-1">
                    <svg className="h-5 w-5 max-sm:h-3.5 max-sm:w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-base font-bold max-sm:text-xs">{fmt(e.score)}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Controls - Integrated in table */}
      <div className="border-t border-neutral-800/50 bg-neutral-800/30 px-6 py-4 max-sm:px-3 max-sm:py-3">
        <LeaderboardPagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={transformedEntries.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}
