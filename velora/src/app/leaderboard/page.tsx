// src/app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import Sidebar from "@/components/sidebar";
import { AbstractProfile } from "@/components/abstract-profile";

import RangeFilter from "@/components/leaderboard/rangefilter";
import PodiumCard from "@/components/leaderboard/podiumcard";
import CurrentUserCard from "@/components/leaderboard/currentusercard";
import ProfileModal from "@/components/leaderboard/profilemodal";

import { PROFILE_DB } from "@/components/leaderboard/data";
import type {
  TopUser,
  TableEntry,
  CurrentUser,
  RangeKey,
  UserProfile,
} from "@/components/leaderboard/types";

/* Avatar placeholder contoh */
function AccountIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`text-neutral-200 ${className}`} fill="currentColor">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0v1H4v-1z" />
    </svg>
  );
}
const AvatarPlaceholder = () => <AccountIcon className="h-3/5 w-3/5" />;

interface LeaderboardUser {
  user_addr: string;
  total_points: number;
  username?: string;
  avatar_url?: string;
}

// Helper function to shorten wallet address
const shortenAddress = (addr: string): string => {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function LeaderboardPage() {
  const { address } = useAccount();
  const podiumAvatar = <AvatarPlaceholder />;
  const rowAvatar = <AvatarPlaceholder />;

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("week");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<UserProfile | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);

        // Aggregate total points per user from user_video_progress
        const { data, error } = await supabase
          .from("user_video_progress")
          .select(`
            user_addr,
            total_points_earned
          `);

        if (error) {
          console.error("[Leaderboard] Error fetching data:", error);
          setLeaderboardData([]);
          return;
        }

        // Group by user_addr and sum total_points_earned
        const userPointsMap = new Map<string, number>();
        data?.forEach((record) => {
          const addr = record.user_addr.toLowerCase();
          const points = record.total_points_earned || 0;
          userPointsMap.set(addr, (userPointsMap.get(addr) || 0) + points);
        });

        // Convert to array and filter out users with 0 points
        const userAddresses = Array.from(userPointsMap.entries())
          .filter(([_, points]) => points > 0)
          .map(([addr, points]) => ({ user_addr: addr, total_points: points }));

        // Fetch user profiles
        const addresses = userAddresses.map((u) => u.user_addr);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("abstract_id, username, avatar_url")
          .in("abstract_id", addresses);

        // Merge profiles with points
        const leaderboard: LeaderboardUser[] = userAddresses.map((user) => {
          const profile = profiles?.find(
            (p) => p.abstract_id?.toLowerCase() === user.user_addr
          );
          return {
            ...user,
            username: profile?.username || shortenAddress(user.user_addr),
            avatar_url: profile?.avatar_url || undefined,
          };
        });

        // Sort by total_points descending
        leaderboard.sort((a, b) => b.total_points - a.total_points);

        setLeaderboardData(leaderboard);
      } catch (err) {
        console.error("[Leaderboard] Unexpected error:", err);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [range]);

  useEffect(() => setPage(1), [range, pageSize]);

  useEffect(() => setPage(1), [range, pageSize]);

  // Convert leaderboard data to display format
  const top3: [TopUser, TopUser, TopUser] = [
    leaderboardData[1] ? {
      rank: 2,
      name: leaderboardData[1].username || shortenAddress(leaderboardData[1].user_addr),
      handle: leaderboardData[1].user_addr, // Kirim alamat wallet lengkap
      score: leaderboardData[1].total_points,
      avatarUrl: leaderboardData[1].avatar_url,
      avatarNode: leaderboardData[1].avatar_url ? (
        <img src={leaderboardData[1].avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <AbstractProfile address={leaderboardData[1].user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
      ),
    } : { rank: 2, name: "—", handle: "—", score: 0, avatarNode: podiumAvatar },
    
    leaderboardData[0] ? {
      rank: 1,
      name: leaderboardData[0].username || shortenAddress(leaderboardData[0].user_addr),
      handle: leaderboardData[0].user_addr, // Kirim alamat wallet lengkap
      score: leaderboardData[0].total_points,
      avatarUrl: leaderboardData[0].avatar_url,
      avatarNode: leaderboardData[0].avatar_url ? (
        <img src={leaderboardData[0].avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <AbstractProfile address={leaderboardData[0].user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
      ),
    } : { rank: 1, name: "—", handle: "—", score: 0, avatarNode: podiumAvatar },
    
    leaderboardData[2] ? {
      rank: 3,
      name: leaderboardData[2].username || shortenAddress(leaderboardData[2].user_addr),
      handle: leaderboardData[2].user_addr, // Kirim alamat wallet lengkap
      score: leaderboardData[2].total_points,
      avatarUrl: leaderboardData[2].avatar_url,
      avatarNode: leaderboardData[2].avatar_url ? (
        <img src={leaderboardData[2].avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <AbstractProfile address={leaderboardData[2].user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
      ),
    } : { rank: 3, name: "—", handle: "—", score: 0, avatarNode: podiumAvatar },
  ];

  // Table entries (rank 4+)
  const entries: TableEntry[] = leaderboardData.slice(3).map((user, index) => ({
    rank: index + 4,
    name: user.username || shortenAddress(user.user_addr),
    handle: user.user_addr, // Kirim alamat wallet lengkap
    score: user.total_points,
    avatarUrl: user.avatar_url,
    avatarNode: user.avatar_url ? (
      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
    ) : (
      <AbstractProfile address={user.user_addr as `0x${string}`} size="sm" showTooltip={false} ring={false} />
    ),
  }));

  // Current user
  const currentUserIndex = address
    ? leaderboardData.findIndex((u) => u.user_addr.toLowerCase() === address.toLowerCase())
    : -1;
  
  const currentUser: CurrentUser | null =
    currentUserIndex >= 0
      ? {
          rank: currentUserIndex + 1,
          name: "You",
          handle: leaderboardData[currentUserIndex].user_addr, // Kirim alamat wallet lengkap
          score: leaderboardData[currentUserIndex].total_points,
          avatarUrl: leaderboardData[currentUserIndex].avatar_url,
          avatarNode: leaderboardData[currentUserIndex].avatar_url ? (
            <img src={leaderboardData[currentUserIndex].avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <AbstractProfile address={leaderboardData[currentUserIndex].user_addr as `0x${string}`} size="sm" showTooltip={false} ring={false} />
          ),
        }
      : null;

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);
  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  function openProfile(u: { name: string; handle: string; rank?: number; score?: number; avatarUrl?: string }) {
    const found = PROFILE_DB[u.handle];
    setSelected(
      found ?? {
        name: u.name,
        handle: u.handle,
        rank: u.rank,
        score: u.score,
        avatarUrl: u.avatarUrl,
        purchases: [],
        activity: [],
      },
    );
  }

  if (loading) {
    return (
      <div className="flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-400">Loading leaderboard...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Leaderboard</h2>
            <RangeFilter value={range} onChange={setRange} />
          </div>

          {/* Top 3 */}
          <div className="grid grid-cols-1 place-items-center gap-12 sm:grid-cols-3">
            <PodiumCard user={top3.find((u) => u.rank === 2)!} borderClass="border-neutral-700" onOpen={openProfile} />
            <PodiumCard user={top3.find((u) => u.rank === 1)!} highlight onOpen={openProfile} />
            <PodiumCard user={top3.find((u) => u.rank === 3)!} borderClass="border-neutral-700" onOpen={openProfile} />
          </div>

          {/* Current user */}
          {currentUser && <CurrentUserCard user={currentUser} fmt={fmt} />}

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-800">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-50 sm:pl-6">Rank</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">User</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                {pageEntries.map((e) => (
                  <tr key={e.rank} className="bg-neutral-800/50 hover:bg-neutral-800 cursor-pointer transition-colors" onClick={() => openProfile({ name: e.name, handle: e.handle, rank: e.rank, score: e.score, avatarUrl: e.avatarUrl })}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-50 sm:pl-6">
                      {e.rank}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-400">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
                          {e.avatarNode}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-50">{e.name}</div>
                          <div className="text-neutral-400">@{shortenAddress(e.handle)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-neutral-50">
                      {fmt(e.score)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 bg-neutral-900 px-4 py-3 sm:flex-row">
              <div className="text-sm text-neutral-400">
                Showing <span className="text-neutral-50">{start + 1}</span>–
                <span className="text-neutral-50">{Math.min(start + pageSize, entries.length)}</span> of{" "}
                <span className="text-neutral-50">{fmt(entries.length)}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-400">
                  Rows per page{" "}
                  <select
                    className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800 disabled:opacity-40"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-neutral-400">
                    Page <span className="text-neutral-50">{page}</span> of{" "}
                    <span className="text-neutral-50">{totalPages}</span>
                  </span>
                  <button
                    className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800 disabled:opacity-40"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selected && <ProfileModal profile={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
