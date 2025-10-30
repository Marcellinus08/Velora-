"use client";

import React, { useEffect, useState } from "react";
import MI from "./MI";
import type { UserProfile, HistoryItem, ActivityItem, HistoryStats, ActivityStats } from "./types";
import { AbstractProfile } from "@/components/abstract-profile";

// Helper function to shorten wallet address
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

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-[var(--primary-500)] text-white" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2">
      <div>
        <div className="text-xs text-neutral-400">{label}</div>
        <div className="text-sm font-semibold text-neutral-50">{value}</div>
      </div>
    </div>
  );
}

export default function ProfileModal({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [tab, setTab] = React.useState<"history" | "activity">("history");
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
  const [copied, setCopied] = React.useState(false);
  const [historyFilter, setHistoryFilter] = React.useState<string>("all");
  const [activityFilter, setActivityFilter] = React.useState<string>("all");

  // State for API data
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch history data
  useEffect(() => {
    if (tab === "history") {
      setLoading(true);
      fetch(`/api/leaderboard/history?userAddr=${profile.handle}&type=${historyFilter}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHistoryData(data.history || []);
            setHistoryStats(data.stats || null);
          }
        })
        .catch((err) => console.error("Error fetching history:", err))
        .finally(() => setLoading(false));
    }
  }, [tab, profile.handle, historyFilter]);

  // Fetch activity data
  useEffect(() => {
    if (tab === "activity") {
      setLoading(true);
      fetch(`/api/leaderboard/activity?userAddr=${profile.handle}&type=${activityFilter}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setActivityData(data.activities || []);
            setActivityStats(data.stats || null);
          }
        })
        .catch((err) => console.error("Error fetching activity:", err))
        .finally(() => setLoading(false));
    }
  }, [tab, profile.handle, activityFilter]);

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtNum = (n?: number) => (n == null ? "-" : Intl.NumberFormat("en-US").format(n));

  React.useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  // Filter and sort history
  const filteredHistory = React.useMemo(() => {
    let filtered = historyData;
    
    // Search filter
    if (q) {
      filtered = filtered.filter((item) => {
        if (item.type === "video_purchase") {
          return item.video.title.toLowerCase().includes(q.toLowerCase());
        }
        if (item.type === "meet_purchase") {
          return item.meet.creator.toLowerCase().includes(q.toLowerCase());
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });

    return filtered;
  }, [historyData, q, sort]);

  // Filter and sort activity
  const filteredActivity = React.useMemo(() => {
    let filtered = activityData;
    
    // Search filter
    if (q) {
      filtered = filtered.filter((item) => 
        item.description.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });

    return filtered;
  }, [activityData, q, sort]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* Header */}
        <div className="grid grid-cols-1 gap-6 border-b border-neutral-800 p-6 sm:grid-cols-3">
          <div className="col-span-2 flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-16 w-16 rounded-full border-2 border-neutral-700 object-cover"
              />
            ) : (
              <AbstractProfile
                address={profile.handle as `0x${string}`}
                size="lg"
                showTooltip={false}
                ring={true}
                ringWidth={2}
              />
            )}
            <div>
              <div className="text-lg font-semibold text-neutral-50">
                {profile.name}
              </div>
              <div 
                className="mt-1 flex items-center gap-2 text-sm text-neutral-400 group cursor-pointer hover:text-neutral-300 transition-colors"
                onClick={copyAddress}
                title="Click to copy full address"
              >
                <span className="font-mono">{shortenAddress(profile.handle)}</span>
                <svg 
                  className={`h-4 w-4 transition-all ${copied ? 'text-green-400' : 'text-neutral-500 group-hover:text-neutral-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {copied ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
                {copied && <span className="text-xs text-green-400 font-medium">Copied!</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Points" value={`${fmtNum(profile.score)} pts`} />
            <StatCard label="Spent" value={historyStats ? `$${fmtNum(historyStats.totalSpent)}` : "$0"} />
            <StatCard label="Rank" value={profile.rank ? `#${fmtNum(profile.rank)}` : "-"} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-6 py-3">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "history"} onClick={() => setTab("history")} label="History" />
            <TabButton active={tab === "activity"} onClick={() => setTab("activity")} label="Activity" />
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter by type */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-400">
              Filter
              <select
                value={tab === "history" ? historyFilter : activityFilter}
                onChange={(e) => tab === "history" ? setHistoryFilter(e.target.value) : setActivityFilter(e.target.value)}
                className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50 text-sm"
              >
                {tab === "history" ? (
                  <>
                    <option value="all">All Transactions</option>
                    <option value="videos">Video Purchases</option>
                    <option value="subscriptions">Subscriptions</option>
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
            <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5">
              <MI name="search" className="text-[14px] text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === "history" ? "Search transactions" : "Search activities"}
                className="w-48 bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-400"
              />
            </div>
            <label className="text-sm text-neutral-400">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
        </div>

        {/* Stats Summary */}
        {tab === "history" && historyStats && (
          <div className="px-6 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Total Spent</div>
              <div className="text-sm font-bold text-green-400">${fmtNum(historyStats.totalSpent)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Videos</div>
              <div className="text-sm font-bold text-blue-400">{historyStats.videoPurchases}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Meets</div>
              <div className="text-sm font-bold text-purple-400">{historyStats.meetPurchases}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Total</div>
              <div className="text-sm font-bold text-yellow-400">{historyStats.totalTransactions}</div>
            </div>
          </div>
        )}

        {tab === "activity" && activityStats && (
          <div className="px-6 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Points Earned</div>
              <div className="text-sm font-bold text-yellow-400">{fmtNum(activityStats.totalPointsEarned)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Videos</div>
              <div className="text-sm font-bold text-blue-400">{activityStats.videosUploaded}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Tasks</div>
              <div className="text-sm font-bold text-green-400">{activityStats.tasksCompleted}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
              <div className="text-xs text-neutral-400">Earnings</div>
              <div className="text-sm font-bold text-green-400">${fmtNum(activityStats.totalEarnings)}</div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-400">Loading...</div>
            </div>
          ) : tab === "history" ? (
            filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 hover:bg-neutral-900/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Icon/Thumbnail */}
                        {item.type === "video_purchase" && item.video.thumbnail && (
                          <img
                            src={item.video.thumbnail}
                            alt={item.video.title}
                            className="h-12 w-20 rounded object-cover"
                          />
                        )}
                        {item.type === "meet_purchase" && (
                          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <MI name="video_call" className="text-purple-400 text-xl" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          {item.type === "video_purchase" && (
                            <>
                              <div className="font-semibold text-neutral-50">{item.video.title}</div>
                              <div className="text-xs text-neutral-400 mt-1">
                                by {item.video.creator}
                              </div>
                            </>
                          )}
                          {item.type === "meet_purchase" && (
                            <>
                              <div className="font-semibold text-neutral-50">
                                Call with {item.meet.creator}
                              </div>
                              <div className="text-xs text-neutral-400 mt-1">
                                {item.meet.duration} minutes
                                {item.meet.scheduledAt && ` • ${formatDate(item.meet.scheduledAt)}`}
                              </div>
                            </>
                          )}
                          {item.type === "subscription" && (
                            <>
                              <div className="font-semibold text-neutral-50">
                                {item.tier} Subscription
                              </div>
                              <div className="text-xs text-neutral-400 mt-1">
                                {formatDate(item.startDate)} - {formatDate(item.endDate)}
                              </div>
                            </>
                          )}
                          {item.type === "ad_purchase" && (
                            <>
                              <div className="font-semibold text-neutral-50">
                                {item.adType} Advertisement
                              </div>
                              <div className="text-xs text-neutral-400 mt-1">
                                {item.duration} days
                                {item.impressions && ` • ${fmtNum(item.impressions)} impressions`}
                              </div>
                            </>
                          )}
                          
                          {/* Date and Status */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-neutral-500">{formatDate(item.date)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === "completed" || item.status === "active" 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-bold text-green-400">
                          {formatCurrency(item.price, item.currency)}
                        </div>
                        {"txHash" in item && item.txHash && (
                          <a
                            href={`https://explorer.abs.xyz/tx/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                          >
                            View TX
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <MI name="receipt_long" className="text-5xl text-neutral-700 mb-3" />
                <div className="text-sm text-neutral-400">No purchase history found.</div>
              </div>
            )
          ) : (
            filteredActivity.length > 0 ? (
              <div className="space-y-3">
                {filteredActivity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 hover:bg-neutral-900/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        item.type === "video_upload" ? "bg-blue-500/20" :
                        item.type === "task_completed" ? "bg-green-500/20" :
                        item.type === "meet_hosted" ? "bg-purple-500/20" :
                        item.type === "milestone" ? "bg-yellow-500/20" :
                        "bg-neutral-700/50"
                      }`}>
                        <MI 
                          name={item.icon} 
                          className={`text-xl ${
                            item.type === "video_upload" ? "text-blue-400" :
                            item.type === "task_completed" ? "text-green-400" :
                            item.type === "meet_hosted" ? "text-purple-400" :
                            item.type === "milestone" ? "text-yellow-400" :
                            "text-neutral-400"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="text-sm text-neutral-50">{item.description}</div>
                        
                        {/* Additional Info */}
                        {"video" in item && item.video && (
                          <div className="text-xs text-neutral-400 mt-1">
                            {"views" in item.video && item.video.views !== undefined && `${fmtNum(item.video.views)} views`}
                            {"likes" in item.video && item.video.likes !== undefined && ` • ${fmtNum(item.video.likes)} likes`}
                          </div>
                        )}
                        
                        {"post" in item && item.post && (
                          <div className="text-xs text-neutral-400 mt-1">
                            {item.post.likes} likes • {item.post.comments} comments
                          </div>
                        )}

                        {"earnings" in item && item.earnings !== undefined && (
                          <div className="text-xs text-green-400 mt-1 font-semibold">
                            Earned: ${fmtNum(item.earnings)}
                          </div>
                        )}

                        {/* Date */}
                        <div className="text-xs text-neutral-500 mt-2">{formatDate(item.date)}</div>
                      </div>

                      {/* Points */}
                      <div className="flex items-center gap-1 text-yellow-400">
                        <MI name="star" className="text-sm" />
                        <span className="text-sm font-semibold">+{item.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <MI name="history" className="text-5xl text-neutral-700 mb-3" />
                <div className="text-sm text-neutral-400">No activity found.</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
