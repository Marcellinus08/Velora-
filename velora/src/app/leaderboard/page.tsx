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
      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
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
            <img src={leaderboardData[currentUserIndex].avatar_url} alt="" className="h-full w-full object-cover" />
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
      <div className="flex h-full grow flex-row pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 md:ml-64">
          <LeaderboardPageSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full grow flex-row pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 md:ml-64">
          <LeaderboardEmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-row pb-16 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 md:ml-64">
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          {/* Simple Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-50">Leaderboard</h2>
              <p className="text-xs sm:text-sm text-neutral-400">Top performing community members</p>
            </div>
          </div>

          {/* Players count - positioned separately */}
          <div className="flex justify-end -mt-2 sm:-mt-3">
            <div className="text-xs sm:text-sm text-neutral-400">
              <span className="font-medium">{fmt(leaderboardData.length)}</span> players
            </div>
          </div>

          {/* Current user highlight */}
          {currentUser && (
            <div 
              className="flex items-center justify-between rounded-lg sm:rounded-xl border border-purple-500/30 bg-purple-500/5 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 cursor-pointer hover:bg-purple-500/10 transition-all duration-300 hover:border-purple-500/50 group"
              onClick={() => openProfile(currentUser.handle)}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/40 bg-neutral-800 flex-shrink-0">
                  {currentUser.avatarNode}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-bold text-neutral-50 truncate">{currentUser.name}</div>
                  <div className="text-xs sm:text-sm text-neutral-400">Your ranking position</div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-shrink-0">
                <div className="text-right">
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-neutral-500">Rank</div>
                  <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-purple-400">#{currentUser.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-neutral-500">Score</div>
                  <div className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-yellow-400">{fmt(currentUser.score)}</div>
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
