// src/components/profile/stats.tsx
"use client";

import type { ProfileStats } from "./types";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function ProfileStatsCard({
  stats,
  rank,
  profit,
}: {
  stats: ProfileStats;
  /** Overall rank info untuk menggantikan ETH card */
  rank?: { rank: number; total: number };
  /** Total earnings from video sales + meets */
  profit?: number;
}) {
  const topPercent =
    rank && rank.total > 0
      ? Math.round(((rank.rank / rank.total) * 100) * 10) / 10
      : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {/* Followers */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
        <p className="text-xs font-medium text-neutral-400">Followers</p>
        <p className="mt-2 text-xl font-semibold text-neutral-50">{fmt(stats.followers)}</p>
      </div>

      {/* Following */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
        <p className="text-xs font-medium text-neutral-400">Following</p>
        <p className="mt-2 text-xl font-semibold text-neutral-50">{fmt(stats.following)}</p>
      </div>

      {/* Profit - NEW */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
        <p className="text-xs font-medium text-neutral-400">Profit</p>
        <p className="mt-2 text-xl font-semibold text-green-400">
          ${(profit || 0).toFixed(2)}
        </p>
      </div>

      {/* Points */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
        <p className="text-xs font-medium text-neutral-400">Points</p>
        <p className="mt-2 text-xl font-semibold text-yellow-400">{fmt(stats.points)}</p>
      </div>

      {/* Rank (menggantikan ETH) */}
      {rank ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-xs font-medium text-neutral-400">Rank</p>
          {rank.rank > 0 ? (
            <p className="mt-2 text-xl font-semibold text-neutral-50">#{fmt(rank.rank)}</p>
          ) : (
            <p className="mt-2 text-xl font-semibold text-neutral-500">Unranked</p>
          )}
        </div>
      ) : (
        // fallback kalau belum ada data rank (opsional, biar tidak pecah)
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-xs font-medium text-neutral-400">Rank</p>
          <p className="mt-2 text-xl font-semibold text-neutral-500">Unranked</p>
        </div>
      )}
    </div>
  );
}
