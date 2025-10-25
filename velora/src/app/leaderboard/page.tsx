// src/app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import Sidebar from "@/components/sidebar";
import { AbstractProfile } from "@/components/abstract-profile";

import RangeFilter from "@/components/leaderboard/rangefilter";
import ProfileModal from "@/components/leaderboard/profilemodal";

import { PROFILE_DB } from "@/components/leaderboard/data";
import type {
  TableEntry,
  CurrentUser,
  RangeKey,
  UserProfile,
} from "@/components/leaderboard/types";

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

  // Convert leaderboard data to display format - only users with points > 0
  // All entries combined (no separate top3 section since we use simple table)
  const entries: TableEntry[] = leaderboardData.map((user, index) => ({
    rank: index + 1,
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
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header with Filter */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Leaderboard</h2>
            <RangeFilter value={range} onChange={setRange} />
          </div>

          {/* Current user highlight */}
          {currentUser && (
            <div className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/5 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/40 bg-neutral-800">
                  {currentUser.avatarNode}
                </div>
                <div>
                  <div className="text-lg font-bold text-neutral-50">You</div>
                  <div className="text-sm text-neutral-400">Your ranking position</div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Rank</div>
                  <div className="mt-1 text-2xl font-bold text-purple-400">#{currentUser.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Score</div>
                  <div className="mt-1 text-2xl font-bold text-yellow-400">{fmt(currentUser.score)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Simple Table List */}
          <div className="overflow-hidden rounded-xl border border-neutral-800/50 bg-neutral-900/30">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-800/50 bg-neutral-800/30">
                  <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">Rank</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400">User</th>
                  <th className="px-3 py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-neutral-400">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/30">
                {pageEntries.map((e) => {
                  const isFirst = e.rank === 1;
                  const isSecond = e.rank === 2;
                  const isThird = e.rank === 3;
                  const isCurrentUser = address && e.handle.toLowerCase() === address.toLowerCase();
                  
                  return (
                    <tr
                      key={e.rank}
                      className={`cursor-pointer transition-all duration-200 ${
                        isFirst
                          ? "bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-transparent hover:from-yellow-900/40 hover:via-yellow-800/30"
                          : isCurrentUser
                          ? "bg-purple-900/20 hover:bg-purple-900/30"
                          : "hover:bg-neutral-800/40"
                      }`}
                      onClick={() => openProfile({ name: e.name, handle: e.handle, rank: e.rank, score: e.score, avatarUrl: e.avatarUrl })}
                    >
                      <td className="whitespace-nowrap py-5 pl-6 pr-3">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold transition-transform hover:scale-105 ${
                            isFirst
                              ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-600/30"
                              : isSecond
                              ? "border-2 border-neutral-500 bg-neutral-800/50 text-neutral-200"
                              : isThird
                              ? "border-2 border-yellow-700/70 bg-yellow-900/20 text-yellow-500"
                              : "text-neutral-400"
                          }`}
                        >
                          {e.rank}
                        </div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-700/50 bg-neutral-800">
                            {e.avatarNode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-semibold text-neutral-50">
                              <span>{e.name}</span>
                              {isCurrentUser && (
                                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30">You</span>
                              )}
                            </div>
                            <div className="mt-0.5 text-xs text-neutral-500">@{shortenAddress(e.handle)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 pr-6 text-right">
                        <div className="inline-flex items-center gap-2 text-yellow-400">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-base font-bold">{fmt(e.score)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-800/50 bg-neutral-800/20 px-6 py-4 sm:flex-row">
              <div className="text-sm text-neutral-400">
                Showing <span className="font-semibold text-neutral-200">{start + 1}</span>–
                <span className="font-semibold text-neutral-200">{Math.min(start + pageSize, entries.length)}</span> of{" "}
                <span className="font-semibold text-neutral-200">{fmt(entries.length)}</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-400">
                  <span>Rows per page</span>
                  <select
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-50 transition-colors hover:border-neutral-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-1.5 text-sm font-medium text-neutral-50 transition-all hover:border-neutral-600 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-neutral-800/50"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span className="min-w-[120px] text-center text-sm text-neutral-400">
                    Page <span className="font-semibold text-neutral-200">{page}</span> of{" "}
                    <span className="font-semibold text-neutral-200">{totalPages}</span>
                  </span>
                  <button
                    className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-1.5 text-sm font-medium text-neutral-50 transition-all hover:border-neutral-600 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-neutral-800/50"
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
