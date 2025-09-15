// src/components/profile/stats.tsx
"use client";

import type { ProfileStats } from "./types";

export default function ProfileStatsCard({ stats }: { stats: ProfileStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Followers</p>
        <p className="font-semibold text-neutral-50">{stats.followers}</p>
      </div>
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Following</p>
        <p className="font-semibold text-neutral-50">{stats.following}</p>
      </div>
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">Points</p>
        <p className="font-semibold text-yellow-400">{stats.points}</p>
      </div>
      <div className="rounded-lg bg-neutral-800/60 p-3 text-center">
        <p className="text-neutral-400">ETH</p>
        <p className="font-semibold text-emerald-400">{stats.eth} ETH</p>
      </div>
    </div>
  );
}
