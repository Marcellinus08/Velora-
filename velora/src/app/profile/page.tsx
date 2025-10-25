// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import ProfileHeader from "@/components/profile/header";
import ProfileStatsCard from "@/components/profile/stats";
import ProfileActivity from "@/components/profile/activity";
import type { ProfileUser, HistoryItem } from "@/components/profile/types";

// Helper to shorten wallet address
const shortenAddress = (addr: string): string => {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function ProfilePage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    user: ProfileUser;
    rank: { rank: number; total: number } | null;
  } | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userAddress = address.toLowerCase();

        // Fetch profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url, bio, abstract_id")
          .eq("abstract_id", userAddress)
          .single();

        // Count followers (people who follow this user)
        const { count: followersCount } = await supabase
          .from("profiles_follows")
          .select("id", { count: "exact", head: true })
          .eq("followee_addr", userAddress);

        // Count following (people this user follows)
        const { count: followingCount } = await supabase
          .from("profiles_follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_addr", userAddress);

        // Calculate total points from user_video_progress
        const { data: progressData } = await supabase
          .from("user_video_progress")
          .select("total_points_earned")
          .eq("user_addr", userAddress);

        const totalPoints =
          progressData?.reduce(
            (sum, record) => sum + (record.total_points_earned || 0),
            0
          ) || 0;

        // Get user's rank from leaderboard
        const { data: allUsers } = await supabase
          .from("user_video_progress")
          .select("user_addr, total_points_earned");

        // Calculate ranks
        const userPointsMap = new Map<string, number>();
        allUsers?.forEach((record) => {
          const addr = record.user_addr.toLowerCase();
          const points = record.total_points_earned || 0;
          userPointsMap.set(addr, (userPointsMap.get(addr) || 0) + points);
        });

        const rankedUsers = Array.from(userPointsMap.entries())
          .filter(([_, points]) => points > 0)
          .sort((a, b) => b[1] - a[1]);

        const userRankIndex = rankedUsers.findIndex(
          ([addr]) => addr === userAddress
        );
        const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;

        // Prepare user data
        const profileUser: ProfileUser = {
          name: profile?.username || "Velora User",
          wallet: profile?.username ? shortenAddress(userAddress) : "0x8aae...9A2E",
          avatar: profile?.avatar_url || "https://lh3.googleusercontent.com/a-/AOh14Gh2wGwxyz=s96-c",
          bio: profile?.bio || "Content creator and photography enthusiast. Sharing my journey and skills with the world.",
          stats: {
            followers: followersCount || 0,
            following: followingCount || 0,
            points: totalPoints,
          },
          interests: ["Cooking", "Photography", "Business", "Music"],
          activity: [
            { id: 1, type: "video", title: "How to shoot portraits with natural light", time: "2h ago" },
            { id: 2, type: "post", title: "Behind the scene of my last workshop", time: "1d ago" },
            { id: 3, type: "badge", title: "Completed: Lighting Basics", time: "3d ago" },
          ],
        };

        // Rank data - Set to 0 if user not in ranking
        const overallRank = userRank && userRank > 0
          ? { rank: userRank, total: rankedUsers.length }
          : { rank: 0, total: rankedUsers.length };

        setProfileData({
          user: profileUser,
          rank: overallRank,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Set default data on error
        setProfileData({
          user: {
            name: "Velora User",
            wallet: "0x8aae...9A2E",
            avatar: "https://lh3.googleusercontent.com/a-/AOh14Gh2wGwxyz=s96-c",
            bio: "Content creator and photography enthusiast. Sharing my journey and skills with the world.",
            stats: {
              followers: 1200,
              following: 180,
              points: 2500,
            },
            interests: ["Cooking", "Photography", "Business", "Music"],
            activity: [
              { id: 1, type: "video", title: "How to shoot portraits with natural light", time: "2h ago" },
              { id: 2, type: "post", title: "Behind the scene of my last workshop", time: "1d ago" },
              { id: 3, type: "badge", title: "Completed: Lighting Basics", time: "3d ago" },
            ],
          },
          rank: { rank: 0, total: 0 },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [address]);

  // Default data untuk fallback
  const history: HistoryItem[] = [
    { id: "h1", kind: "order", title: "Bought: Cooking Masterclass", amount: "$10", time: "Mar 12" },
    { id: "h2", kind: "watched", title: "Watched: Portrait Lighting 101", meta: "12 min", time: "Mar 10" },
    { id: "h3", kind: "quiz", title: "Quiz Completed: Camera Basics", meta: "Score 90%", time: "Mar 9" },
    { id: "h4", kind: "reward", title: "Daily Streak Reward", meta: "+50 pts", time: "Mar 9" },
  ];

  if (loading) {
    return (
      <div className="flex h-full grow flex-row">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-400">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex h-full grow flex-row">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-neutral-400">Failed to load profile</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader user={profileData.user} />

        {/* Stats + Rank (rank menggantikan ETH) */}
        <div className="mt-6">
          <ProfileStatsCard stats={profileData.user.stats} rank={profileData.rank || undefined} />
        </div>

        {/* Riwayat/aktivitas (kamu sudah punya komponen History/Activity) */}
        <div className="mt-10 gap-6">
          <aside className="col-span-12 lg:col-span-6">
            <ProfileActivity items={history} />
          </aside>
        </div>
      </main>
    </div>
  );
}
