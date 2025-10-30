// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import ProfileHeader from "@/components/profile/header";
import ProfileStatsCard from "@/components/profile/stats";
import ProfileActivity from "@/components/profile/activity";
import type { ProfileUser, HistoryItem } from "@/components/profile/types";
import type { HistoryItem as LeaderboardHistoryItem, ActivityItem, HistoryStats, ActivityStats } from "@/components/leaderboard/types";
import MI from "@/components/leaderboard/MI";

// Helper to shorten wallet address
const shortenAddress = (addr: string): string => {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Helper function to format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "USDC"): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

const fmtNum = (n?: number) => (n == null ? "-" : Intl.NumberFormat("en-US").format(n));

export default function ProfilePage() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const addrParam = searchParams?.get("addr");
  
  // Use address from URL parameter if available, otherwise use connected wallet
  const targetAddress = addrParam || address;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    user: ProfileUser;
    rank: { rank: number; total: number } | null;
  } | null>(null);

  // Tab state for History/Activity (default to history)
  const [activeTab, setActiveTab] = useState<"history" | "activity">("history");
  const [historyFilter, setHistoryFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // API data state
  const [historyData, setHistoryData] = useState<LeaderboardHistoryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loadingTabData, setLoadingTabData] = useState(false);

  // Fetch history data when History tab is active
  useEffect(() => {
    if (activeTab === "history" && targetAddress) {
      setLoadingTabData(true);
      fetch(`/api/leaderboard/history?userAddr=${targetAddress}&type=${historyFilter}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHistoryData(data.history || []);
            setHistoryStats(data.stats || null);
          }
        })
        .catch((err) => console.error("Error fetching history:", err))
        .finally(() => setLoadingTabData(false));
    }
  }, [activeTab, targetAddress, historyFilter]);

  // Fetch activity data when Activity tab is active
  useEffect(() => {
    if (activeTab === "activity" && targetAddress) {
      setLoadingTabData(true);
      fetch(`/api/leaderboard/activity?userAddr=${targetAddress}&type=${activityFilter}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setActivityData(data.activities || []);
            setActivityStats(data.stats || null);
          }
        })
        .catch((err) => console.error("Error fetching activity:", err))
        .finally(() => setLoadingTabData(false));
    }
  }, [activeTab, targetAddress, activityFilter]);

  useEffect(() => {
    async function fetchProfileData() {
      if (!targetAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userAddress = targetAddress.toLowerCase();

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
  }, [targetAddress]);

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
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader user={profileData.user} address={targetAddress} />

        {/* Stats + Rank */}
        <div className="mt-6">
          <ProfileStatsCard stats={profileData.user.stats} rank={profileData.rank || undefined} />
        </div>

        {/* Tabs: History / Activity */}
        <div className="mt-10">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "activity"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Filter & Search */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter by type */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">
                Filter
                <select
                  value={activeTab === "history" ? historyFilter : activityFilter}
                  onChange={(e) =>
                    activeTab === "history"
                      ? setHistoryFilter(e.target.value)
                      : setActivityFilter(e.target.value)
                  }
                  className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {activeTab === "history" ? (
                    <>
                      <option value="all">All Transactions</option>
                      <option value="videos">Video Purchases</option>
                      <option value="meets">Meet Calls</option>
                      <option value="ads">Ads</option>
                    </>
                  ) : (
                    <>
                      <option value="all">All Activities</option>
                      <option value="content">Content</option>
                      <option value="tasks">Tasks</option>
                      <option value="social">Social</option>
                      <option value="earnings">Earnings</option>
                    </>
                  )}
                </select>
              </label>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2">
                <MI name="search" className="text-[14px] text-neutral-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === "history" ? "Search transactions" : "Search activities"}
                  className="w-48 bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-400"
                />
              </div>
              <label className="text-sm text-neutral-400">
                Sort
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-neutral-50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>
          </div>

          {/* Stats Summary Cards */}
          {activeTab === "history" && historyStats && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Total Spent</div>
                <div className="mt-1 text-lg font-bold text-green-400">${fmtNum(historyStats.totalSpent)}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Videos</div>
                <div className="mt-1 text-lg font-bold text-blue-400">{historyStats.videoPurchases}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Meets</div>
                <div className="mt-1 text-lg font-bold text-purple-400">{historyStats.meetPurchases}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Ads</div>
                <div className="mt-1 text-lg font-bold text-yellow-400">{historyStats.adsCreated}</div>
              </div>
            </div>
          )}

          {activeTab === "activity" && activityStats && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Points Earned</div>
                <div className="mt-1 text-lg font-bold text-yellow-400">{fmtNum(activityStats.totalPointsEarned)}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Videos</div>
                <div className="mt-1 text-lg font-bold text-blue-400">{activityStats.videosUploaded}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Tasks</div>
                <div className="mt-1 text-lg font-bold text-green-400">{activityStats.tasksCompleted}</div>
              </div>
              <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 text-center backdrop-blur-sm">
                <div className="text-xs font-medium text-neutral-400">Money Earned</div>
                <div className="mt-1 text-lg font-bold text-green-400">${fmtNum(activityStats.totalEarnings)}</div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="mt-6">
            {loadingTabData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-neutral-400">Loading...</div>
              </div>
            ) : activeTab === "history" ? (
              historyData.length > 0 ? (
                <div className="space-y-3">
                  {historyData
                    .filter((item) => {
                      if (!searchQuery) return true;
                      if (item.type === "video_purchase") {
                        return item.video.title.toLowerCase().includes(searchQuery.toLowerCase());
                      }
                      if (item.type === "meet_purchase") {
                        return item.meet.creator.toLowerCase().includes(searchQuery.toLowerCase());
                      }
                      return true;
                    })
                    .sort((a, b) => {
                      const ta = new Date(a.date).getTime();
                      const tb = new Date(b.date).getTime();
                      return sortOrder === "newest" ? tb - ta : ta - tb;
                    })
                    .map((item) => {
                      // Navigation URL based on type
                      const getNavigationUrl = () => {
                        if (item.type === "video_purchase" && item.video.id) {
                          return `/task?id=${item.video.id}`;
                        }
                        if (item.type === "meet_purchase" && item.meet.id) {
                          return `/meet/${item.meet.id}`;
                        }
                        return null;
                      };

                      const navUrl = getNavigationUrl();

                      return (
                        <div
                          key={item.id}
                          onClick={() => navUrl && (window.location.href = navUrl)}
                          className={`group rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/80 hover:shadow-lg ${
                            navUrl ? "cursor-pointer" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Icon/Thumbnail */}
                              {item.type === "video_purchase" && item.video.thumbnail && (
                                <img
                                  src={item.video.thumbnail}
                                  alt={item.video.title}
                                  className="h-16 w-24 rounded-lg object-cover flex-shrink-0"
                                />
                              )}
                              {item.type === "meet_purchase" && (
                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20 ring-1 ring-purple-500/30">
                                  <MI name="video_call" className="text-2xl text-purple-400" />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {item.type === "video_purchase" && (
                                  <>
                                    <div className="font-semibold text-neutral-50 group-hover:text-white truncate">
                                      {item.video.title}
                                    </div>
                                    <div className="mt-1 text-xs text-neutral-400">by {item.video.creator}</div>
                                  </>
                                )}
                                {item.type === "meet_purchase" && (
                                  <>
                                    <div className="font-semibold text-neutral-50 group-hover:text-white">
                                      Call with {item.meet.creator}
                                    </div>
                                    <div className="mt-1 text-xs text-neutral-400">
                                      {item.meet.duration} minutes
                                      {item.meet.scheduledAt && ` • ${formatDate(item.meet.scheduledAt)}`}
                                    </div>
                                  </>
                                )}

                                {/* Date and Status */}
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-neutral-500">{formatDate(item.date)}</span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                      item.status === "completed"
                                        ? "bg-green-500/20 text-green-400"
                                        : item.status === "scheduled"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-green-500/20 text-green-400"
                                    }`}
                                  >
                                    {item.status === "active" || item.status === "completed" ? "Purchased" : item.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price - Center Aligned */}
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-green-400 whitespace-nowrap">
                                {formatCurrency(item.price, item.currency)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 py-16 text-center">
                  <MI name="receipt_long" className="mb-3 text-6xl text-neutral-700" />
                  <div className="text-sm font-medium text-neutral-400">No purchase history found.</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Transactions will appear here once you make a purchase.
                  </div>
                </div>
              )
            ) : (
              activityData.length > 0 ? (
                <div className="space-y-3">
                  {activityData
                    .filter((item) => {
                      if (!searchQuery) return true;
                      return item.description.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .sort((a, b) => {
                      const ta = new Date(a.date).getTime();
                      const tb = new Date(b.date).getTime();
                      return sortOrder === "newest" ? tb - ta : ta - tb;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/80 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${
                              item.type === "video_upload"
                                ? "bg-blue-500/20 ring-blue-500/30"
                                : item.type === "task_completed"
                                ? "bg-green-500/20 ring-green-500/30"
                                : item.type === "meet_hosted"
                                ? "bg-purple-500/20 ring-purple-500/30"
                                : item.type === "milestone"
                                ? "bg-yellow-500/20 ring-yellow-500/30"
                                : "bg-neutral-700/50 ring-neutral-600/30"
                            }`}
                          >
                            <MI
                              name={item.icon}
                              className={`text-2xl ${
                                item.type === "video_upload"
                                  ? "text-blue-400"
                                  : item.type === "task_completed"
                                  ? "text-green-400"
                                  : item.type === "meet_hosted"
                                  ? "text-purple-400"
                                  : item.type === "milestone"
                                  ? "text-yellow-400"
                                  : "text-neutral-400"
                              }`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="font-medium text-neutral-50 group-hover:text-white">
                              {item.description}
                            </div>

                            {/* Additional Info */}
                            {"video" in item && item.video && "views" in item.video && (
                              <div className="mt-2 text-xs text-neutral-400">
                                {item.video.views !== undefined && `${fmtNum(item.video.views)} views`}
                                {item.video.likes !== undefined && ` • ${fmtNum(item.video.likes)} likes`}
                              </div>
                            )}

                            {"post" in item && item.post && (
                              <div className="mt-2 text-xs text-neutral-400">
                                {item.post.likes} likes • {item.post.comments} comments
                              </div>
                            )}

                            {"earnings" in item && item.earnings !== undefined && (
                              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-400">
                                <MI name="payments" className="text-sm" />
                                Earned: ${fmtNum(item.earnings)}
                              </div>
                            )}

                            {/* Date */}
                            <div className="mt-2 text-xs text-neutral-500">{formatDate(item.date)}</div>
                          </div>

                          {/* Points */}
                          <div className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-1.5 ring-1 ring-yellow-500/20">
                            <MI name="star" className="text-sm text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-400">+{item.points}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 py-16 text-center">
                  <MI name="history" className="mb-3 text-6xl text-neutral-700" />
                  <div className="text-sm font-medium text-neutral-400">No activity found.</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Your activities will appear here as you interact with the platform.
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
