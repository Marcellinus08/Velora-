// src/components/profile/stats.tsx
"use client";

import type { ProfileStats } from "./types";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function ProfileStatsCard({
  stats,
  rank,
}: {
  stats: ProfileStats;
  /** Overall rank info untuk menggantikan ETH card */
  rank?: { rank: number; total: number };
}) {
  const topPercent =
    rank && rank.total > 0
      ? Math.round(((rank.rank / rank.total) * 100) * 10) / 10
      : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Followers */}
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Followers</p>
        <p className="font-semibold text-neutral-50">{fmt(stats.followers)}</p>
      </div>

      {/* Following */}
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Following</p>
        <p className="font-semibold text-neutral-50">{fmt(stats.following)}</p>
      </div>

      {/* Points */}
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Points</p>
        <p className="font-semibold text-yellow-400">{fmt(stats.points)}</p>
      </div>

      {/* Rank (menggantikan ETH) */}
      {rank ? (
        <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
          <p className="text-neutral-400">Rank</p>
          {rank.rank > 0 ? (
            <p className="font-semibold text-neutral-50">#{fmt(rank.rank)}</p>
          ) : (
            <p className="font-semibold text-neutral-500">Unranked</p>
          )}
        </div>
      ) : (
        // fallback kalau belum ada data rank (opsional, biar tidak pecah)
        <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
          <p className="text-neutral-400">Rank</p>
          <p className="font-semibold text-neutral-500">Unranked</p>
        </div>
      )}
    </div>
  );
}
