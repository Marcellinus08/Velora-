// src/app/leaderboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { AbstractProfile } from "@/components/abstract-profile";
import { LeaderboardPageSkeleton, CurrentUserCardSkeleton } from "@/components/skeletons/leaderboard-skeleton";
import { LeaderboardEmptyState } from "@/components/leaderboard/empty-state";

// Lazy load LeaderboardLazy component
const LeaderboardLazy = dynamic(
  () => import("@/components/leaderboard/leaderboard-lazy").then((mod) => ({ default: mod.LeaderboardLazy })),
  {
    loading: () => <div className="h-96 rounded-xl bg-neutral-800/50 animate-pulse" />,
    ssr: true,
  }
);

import type { TableEntry, CurrentUser } from "@/components/leaderboard/types";

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
  const router = useRouter();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);

        // Aggregate total points per user from user_video_progress
        const { data, error: fetchError } = await supabase
          .from("user_video_progress")
          .select(`
            user_addr,
            total_points_earned
          `);

        if (fetchError) {
          console.error("[Leaderboard] Error fetching data:", fetchError);
          setError(fetchError.message);
          setLeaderboardData([]);
          return;
        }

        // Group by user_addr and sum total_points_earned
        const userPointsMap = new Map<string, number>();
        (data || []).forEach((record: any) => {
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
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("abstract_id, username, avatar_url")
          .in("abstract_id", addresses);

        if (profileError) {
          console.error("[Leaderboard] Error fetching profiles:", profileError);
        }

        // Merge profiles with points
        const leaderboard: LeaderboardUser[] = userAddresses.map((user) => {
          const profile = (profiles || []).find(
            (p: any) => p.abstract_id?.toLowerCase() === user.user_addr
          );
          return {
            ...user,
            username: (profile as any)?.username || shortenAddress(user.user_addr),
            avatar_url: (profile as any)?.avatar_url || undefined,
          };
        });

        // Sort by total_points descending
        leaderboard.sort((a, b) => b.total_points - a.total_points);

        setLeaderboardData(leaderboard);
      } catch (err) {
        console.error("[Leaderboard] Unexpected error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Convert leaderboard data to display format - only users with points > 0
  // All entries combined (no separate top3 section since we use simple table)
  const entries: TableEntry[] = leaderboardData.map((user, index) => ({
    rank: index + 1,
    name: user.username || shortenAddress(user.user_addr),
    handle: user.user_addr, // Kirim alamat wallet lengkap
    score: user.total_points,
    avatarUrl: user.avatar_url,
    avatarNode: user.avatar_url ? (
      <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
    ) : (
      <AbstractProfile address={user.user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
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
          name: leaderboardData[currentUserIndex].username || shortenAddress(leaderboardData[currentUserIndex].user_addr),
          handle: leaderboardData[currentUserIndex].user_addr, // Kirim alamat wallet lengkap
          score: leaderboardData[currentUserIndex].total_points,
          avatarUrl: leaderboardData[currentUserIndex].avatar_url,
          avatarNode: leaderboardData[currentUserIndex].avatar_url ? (
            <img src={leaderboardData[currentUserIndex].avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <AbstractProfile address={leaderboardData[currentUserIndex].user_addr as `0x${string}`} size="lg" showTooltip={false} ring={false} />
          ),
        }
      : null;

  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  function openProfile(handle: string) {
    // Redirect to profile page dengan wallet address
    router.push(`/profile?addr=${handle}`);
  }

  if (loading) {
    return (
      <div className="flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:ml-64 md:pb-20 xl:pb-6 max-sm:pb-20">
          <LeaderboardPageSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:ml-64 md:pb-20 xl:pb-6 max-sm:pb-20">
          <LeaderboardEmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:ml-64 max-sm:px-3 max-sm:py-3 max-sm:pb-20 md:pb-20 xl:pb-6">
        <div className="flex flex-col gap-6 max-sm:gap-4">
          {/* Simple Header */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between max-sm:gap-2.5">
            <div className="flex items-center gap-3 max-sm:gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0 max-sm:h-9 max-sm:w-9">
                <svg className="h-6 w-6 text-yellow-400 max-sm:h-4.5 max-sm:w-4.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-neutral-50 max-sm:text-base">Leaderboard</h2>
                <p className="text-sm text-neutral-400 max-sm:text-[11px]">Top performing community members</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-neutral-400 max-sm:text-[11px] max-sm:ml-auto max-sm:self-end">
              <span>{fmt(leaderboardData.length)} players</span>
            </div>
          </div>

          {/* Current user highlight */}
          {currentUser && (
            <div 
              className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/5 px-6 py-4 cursor-pointer hover:bg-purple-500/10 transition-all duration-300 hover:border-purple-500/50 group max-sm:px-3 max-sm:py-2.5 max-sm:rounded-lg"
              onClick={() => openProfile(currentUser.handle)}
            >
              <div className="flex items-center gap-4 max-sm:gap-2 flex-1 min-w-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-purple-500/40 bg-neutral-800 flex-shrink-0 max-sm:h-8 max-sm:w-8 max-sm:border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {currentUser.avatarNode}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-neutral-50 max-sm:text-xs max-sm:leading-tight">{currentUser.name}</div>
                  <div className="text-sm text-neutral-400 max-sm:text-[10px] max-sm:leading-tight whitespace-nowrap">Your ranking position</div>
                </div>
              </div>
              <div className="flex items-center gap-8 max-sm:gap-2.5 flex-shrink-0">
                <div className="text-right max-sm:text-center">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 max-sm:text-[8px]">Rank</div>
                  <div className="mt-1 text-2xl font-bold text-purple-400 max-sm:text-base max-sm:mt-0 max-sm:leading-tight">#{currentUser.rank}</div>
                </div>
                <div className="text-right max-sm:text-center">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500 max-sm:text-[8px]">Score</div>
                  <div className="mt-1 text-2xl font-bold text-yellow-400 max-sm:text-base max-sm:mt-0 max-sm:leading-tight">{fmt(currentUser.score)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Lazy Loading Table */}
          {leaderboardData.length === 0 ? (
            <LeaderboardEmptyState />
          ) : (
            <LeaderboardLazy 
              allEntries={leaderboardData}
              isLoading={loading}
              onUserClick={openProfile}
              currentUserAddress={address}
            />
          )}
        </div>
      </main>
    </div>
  );
}
