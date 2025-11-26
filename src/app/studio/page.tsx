"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { StudioHeaderSkeleton } from "@/components/studio/header-skeleton";
import { StudioStatsSkeleton } from "@/components/studio/stats-skeleton";
import { StudioActionsSkeleton } from "@/components/studio/actions-skeleton";
import { StudioRecentSkeleton } from "@/components/studio/recent-skeleton";
import StudioHeader from "@/components/studio/header";
import StudioStats from "@/components/studio/stats";
import StudioActions from "@/components/studio/actions";
import StudioRecentPanel from "@/components/studio/recent";
import type { StudioVideo, StudioAd, StudioMeet } from "@/components/studio/types";

/* ===== Helpers kecil ===== */
function secondsToDuration(sec?: number | null) {
  if (!sec || sec <= 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d2 = Math.floor(h / 24);
  if (d2 < 30) return `${d2}d ago`;
  const mo = Math.floor(d2 / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

type ApiVideo = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  video_url: string | null;
  thumb_url: string | null;
  price_cents: number | null;
  currency: string | null;
  points_total: number | null;
};

export default function StudioPage() {
  const { address, status } = useAccount();
  const me = useMemo(() => (address ?? "").toLowerCase(), [address]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<StudioVideo[]>([]);
  const [ads, setAds] = useState<StudioAd[]>([]);
  // Meets - COMING SOON
  // const [meets, setMeets] = useState<StudioMeet[]>([]);
  // const [meetsTotal, setMeetsTotal] = useState(0);
  const [earningsUsd, setEarningsUsd] = useState(0);

  async function load() {
    if (!me) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/videos?me=${me}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);

      const items = (json.items as ApiVideo[]).map<StudioVideo>((v) => ({
        id: v.id,
        title: v.title,
        thumb: v.thumb_url || "/placeholder-thumb.jpg",
        duration: secondsToDuration(v.duration_seconds ?? 0),
        views: 0, // belum ada kolom views di skema
        date: timeAgo(v.created_at),
        description: v.description ?? undefined,
        points: v.points_total ?? undefined,

        // buyers & revenue: akan diisi setelah fetch dari video_purchases
        buyers: 0,
        revenueUsd: 0,
      }));

      setVideos(items);

      // Fetch stats and related data
      await fetchStudioStats(items);
      await fetchCampaigns();
      // Meets - COMING SOON
      // await fetchMeets();
    } catch (e: any) {
      console.error("[studio page] load videos failed:", e);
      setError(e?.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns() {
    if (!me) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      type CampaignRow = {
        id: string;
        title: string | null;
        banner_url: string | null;
        status: string;
        duration_days: number | null;
        start_date: string;
        end_date: string;
        created_at: string;
        cta_text: string | null;
        description: string | null;
        creation_fee_cents: number | null;
      };
      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("id,title,banner_url,status,duration_days,start_date,end_date,created_at,cta_text,description,creation_fee_cents")
        .eq("creator_addr", me)
        .order("created_at", { ascending: false }) as { data: CampaignRow[] | null; error: any };

      if (error) {
        console.error("[Studio] Failed to fetch campaigns:", error);
        setAds([]);
        return;
      }

      if (campaigns && campaigns.length > 0) {
        // Fetch clicks for each campaign
        const campaignIds = campaigns.map(c => c.id);
        
        type ClickRow = { campaign_id: string };
        const { data: clicks, error: clicksError } = await supabase
          .from("campaign_clicks")
          .select("campaign_id")
          .in("campaign_id", campaignIds) as { data: ClickRow[] | null; error: any };

        if (clicksError) {
          console.error("[Studio] Failed to fetch clicks:", clicksError);
        }

        // Count clicks per campaign
        const clicksPerCampaign = new Map<string, number>();
        if (clicks) {
          (clicks as ClickRow[]).forEach((click) => {
            const count = clicksPerCampaign.get(click.campaign_id) || 0;
            clicksPerCampaign.set(click.campaign_id, count + 1);
          });
        }

        const now = new Date();
        
  const campaignAds: StudioAd[] = (campaigns as CampaignRow[]).map((c: CampaignRow) => {
          // Determine real-time status based on dates
          let realStatus: StudioAd["status"] = (c.status as StudioAd["status"]) || "active";
          
          const endDate = new Date(c.end_date);
          const startDate = new Date(c.start_date);
          
          // If campaign has ended (past end_date), mark as ended
          if (now > endDate) {
            realStatus = "ended";
          }
          // If campaign hasn't started yet, keep as pending or original status
          else if (now < startDate) {
            realStatus = (c.status === "paused" ? "paused" : "paused"); // treat pending as paused for display
          }
          // If currently within date range and status is active, keep it active
          else if (now >= startDate && now <= endDate) {
            realStatus = c.status === "paused" ? "paused" : "active";
          }
          
          // Calculate points: creation_fee_cents / 10 (e.g., 500 cents = $5 = 50 points)
          const points = c.creation_fee_cents ? Math.floor(c.creation_fee_cents / 10) : 0;
          
          return {
            id: c.id,
            title: c.title || "Untitled",
            banner_url: c.banner_url,
            status: realStatus,
            clicks: clicksPerCampaign.get(c.id) || 0,
            duration_days: c.duration_days || 0,
            start_date: c.start_date,
            end_date: c.end_date,
            created_at: c.created_at,
            cta_text: c.cta_text,
            description: c.description,
            points: points,
          };
        });
        
        setAds(campaignAds);
        console.log("[Studio] Loaded campaigns:", campaignAds.length);
        console.log("[Studio] Clicks per campaign:", Array.from(clicksPerCampaign.entries()));
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("[Studio] Error fetching campaigns:", error);
      setAds([]);
    }
  }

  // Meets function - COMING SOON
  /*
  async function fetchMeets() {
    if (!me) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Fetch all meets where user is the creator
      type MeetRow = {
        id: string;
        participant_addr: string;
        status: string;
        scheduled_at: string;
        duration_minutes: number | null;
        rate_cents_per_min: number | null;
        total_price_cents: number | null;
        created_at: string;
        participant?: { username: string | null; avatar_url: string | null } | null;
      };
      const { data: meetsData, error: fetchError } = await supabase
        .from("meets")
        .select(`
          *,
          participant:profiles!meets_participant_addr_fkey (
            username,
            avatar_url
          )
        `)
        .eq("creator_addr", me)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("[Studio] Error fetching meets:", fetchError);
        setMeets([]);
        setMeetsTotal(0);
        return;
      }

      if (meetsData && meetsData.length > 0) {
        const meetItems = (meetsData as MeetRow[]).map((m): StudioMeet => ({
          id: m.id,
            participant_addr: m.participant_addr,
            participant_name: m.participant?.username || undefined,
            participant_avatar: m.participant?.avatar_url || undefined,
            status: (m.status as StudioMeet["status"]) || "pending",
            scheduled_at: m.scheduled_at,
            duration_minutes: m.duration_minutes || 0,
            rate_usd_per_min: (m.rate_cents_per_min || 0) / 100,
            total_price_cents: m.total_price_cents || 0,
            created_at: m.created_at,
        }));

        setMeets(meetItems);
        
        // Count only completed meets
        const completedCount = meetItems.filter(m => m.status === "completed").length;
        setMeetsTotal(completedCount);
        
        console.log("[Studio] Loaded meets:", meetItems.length);
        console.log("[Studio] Completed meets:", completedCount);
      } else {
        setMeets([]);
        setMeetsTotal(0);
      }
    } catch (error) {
      console.error("[Studio] Error fetching meets:", error);
      setMeets([]);
      setMeetsTotal(0);
    }
  }
  */

  async function fetchStudioStats(videoItems: StudioVideo[]) {
    if (!me || videoItems.length === 0) return;
    
    try {
      // Import supabase client
      const { supabase } = await import("@/lib/supabase");

      // Get all videos owned by this user directly from database
      type VideoRow = { id: string; price_cents: number | null };
      const { data: myVideos, error: videosError } = await supabase
        .from("videos")
        .select("id, price_cents")
        .eq("abstract_id", me);

      console.log('[Studio Stats] My videos from DB:', myVideos);
      console.log('[Studio Stats] Videos error:', videosError);
      
      if (!myVideos || myVideos.length === 0) {
        console.log('[Studio Stats] No videos found for user:', me);
        setEarningsUsd(0);
        return;
      }
      
      const videoIds = (myVideos as VideoRow[]).map(v => v.id);
      
      console.log('[Studio Stats] Video IDs:', videoIds);

      // Fetch all purchases for these videos
      type PurchaseRow = { buyer_id: string; video_id: string };
      const { data: purchases, error: purchaseError } = await supabase
        .from("video_purchases")
        .select("buyer_id, video_id")
        .in("video_id", videoIds);

      console.log('[Studio Stats] Purchases:', purchases);
      console.log('[Studio Stats] Purchase Error:', purchaseError);

      if (purchases && purchases.length > 0) {
        // Count total purchases (not unique buyers)
        const totalPurchases = (purchases as PurchaseRow[]).length;
        console.log('[Studio Stats] Total Purchases:', totalPurchases);

        // Create price map
        const priceMap = new Map<string, number>();
        (myVideos as VideoRow[]).forEach(v => {
          if (v.price_cents) priceMap.set(v.id, v.price_cents);
        });

        // Count buyers per video (purchases per video)
        const buyersPerVideo = new Map<string, number>();
        const revenuePerVideo = new Map<string, number>();

        (purchases as PurchaseRow[]).forEach(p => {
          // Count purchases per video
          buyersPerVideo.set(p.video_id, (buyersPerVideo.get(p.video_id) || 0) + 1);

          // Sum revenue per video (60% for creator)
          const priceCents = priceMap.get(p.video_id) || 0;
          const creatorEarnings = Math.round(priceCents * 0.6); // 60% for creator
          const creatorUsd = creatorEarnings / 100;
          revenuePerVideo.set(p.video_id, (revenuePerVideo.get(p.video_id) || 0) + creatorUsd);
        });

        // Update videos with buyers and revenue data
        const updatedVideos = videoItems.map(video => ({
          ...video,
          buyers: buyersPerVideo.get(video.id) || 0,
          revenueUsd: revenuePerVideo.get(video.id) || 0,
        }));

        setVideos(updatedVideos);

        // Calculate total video earnings (60% creator share)
        const totalVideoEarnings = Array.from(revenuePerVideo.values()).reduce((sum, rev) => sum + rev, 0);
        
        console.log('[Studio Stats] Buyers per video:', Array.from(buyersPerVideo.entries()));
        console.log('[Studio Stats] Revenue per video:', Array.from(revenuePerVideo.entries()));
        console.log('[Studio Stats] Total Video Earnings:', totalVideoEarnings);
        
        // Fetch meet earnings (80% creator share)
        const { data: completedMeets } = await supabase
          .from("meets")
          .select("total_price_cents")
          .eq("creator_addr", me)
          .eq("status", "completed");
        
        const totalMeetEarnings = (completedMeets as Array<{ total_price_cents: number | null }> | null)?.reduce((sum, meet) => {
          const meetTotal = (meet.total_price_cents || 0) / 100;
          return sum + (meetTotal * 0.8); // 80% for creator (payMeet: 80/20)
        }, 0) || 0;
        
        console.log('[Studio Stats] Total Meet Earnings:', totalMeetEarnings);
        
        // Total earnings = video sales + meet bookings
        const totalEarnings = totalVideoEarnings + totalMeetEarnings;
        console.log('[Studio Stats] Total Earnings (Video + Meet):', totalEarnings);
        
        setEarningsUsd(totalEarnings);
      } else {
        console.log('[Studio Stats] No purchases found');
        
        // Still check for meet earnings even if no video sales
        const { data: completedMeets } = await supabase
          .from("meets")
          .select("total_price_cents")
          .eq("creator_addr", me)
          .eq("status", "completed");
        
        const totalMeetEarnings = (completedMeets as Array<{ total_price_cents: number | null }> | null)?.reduce((sum, meet) => {
          const meetTotal = (meet.total_price_cents || 0) / 100;
          return sum + (meetTotal * 0.8); // 80% for creator (payMeet: 80/20)
        }, 0) || 0;
        
        console.log('[Studio Stats] Total Meet Earnings (no video sales):', totalMeetEarnings);
        
        setEarningsUsd(totalMeetEarnings);
      }
    } catch (error) {
      console.error("[Studio Stats] Error:", error);
      setEarningsUsd(0);
    }
  }

  useEffect(() => {
    if (status === "connected" && me) {
      void load();
      // Auto-sync ads points on page load
      void syncAdsPoints();
    }
  }, [status, me]);

  // Auto-sync ads points to ensure user_ads_progress is up-to-date
  async function syncAdsPoints() {
    try {
      const res = await fetch("/api/campaigns/sync-points", {
        method: "POST",
        cache: "no-store"
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log("[Studio] Ads points synced:", result);
      }
    } catch (error) {
      console.error("[Studio] Failed to sync ads points:", error);
    }
  }

  // Create a full page skeleton if loading
  if (loading) {
    return (
      <div className="flex h-full grow flex-row overflow-x-hidden max-w-full">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-sm:px-3 max-sm:py-4 relative overflow-hidden">
          {/* Background decorative elements - matching home page */}
          <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          </div>

          {/* Header skeleton */}
          <div className="relative">
            <StudioHeaderSkeleton />
          </div>

          {/* Stats skeleton */}
          <div className="relative mt-6 max-sm:mt-4">
            <StudioStatsSkeleton />
          </div>

          {/* Actions skeleton */}
          <div className="relative mt-6 max-sm:mt-4">
            <StudioActionsSkeleton />
          </div>

          {/* Recent skeleton */}
          <div className="relative mt-8 max-sm:mt-5">
            <StudioRecentSkeleton />
          </div>

          {/* Floating decorative elements */}
          <div className="fixed bottom-8 right-8 max-sm:bottom-4 max-sm:right-4 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex flex-col gap-3 max-sm:gap-2">
              <div className="w-12 h-12 max-sm:w-8 max-sm:h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
              <div className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-row overflow-x-hidden max-w-full">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-sm:px-3 max-sm:py-4 relative overflow-hidden">
        {/* Background decorative elements - matching home page */}
        <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        {/* Header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
          <div className="relative">
            <StudioHeader />
          </div>
        </div>

        {/* Stats with enhanced styling */}
        <div className="relative mt-5 max-sm:mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-blue-500/3 to-pink-500/3 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <StudioStats
              totals={{
                videos: videos.length,
                campaigns: ads.length,
                meets: 0, // meetsTotal - COMING SOON
                earningsUsd: earningsUsd,
              }}
            />
          </div>
        </div>

        {/* Actions with staggered animation */}
        <div className="relative mt-8 max-sm:mt-5">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-emerald-500/5 rounded-2xl" />
          <div className="relative">
            <StudioActions />
          </div>
        </div>

        {/* Recent panel */}
        <div className="relative mt-8 max-sm:mt-5">
          {error && (
            <div className="rounded-xl border border-red-700/50 bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 p-4 max-sm:p-3 text-sm max-sm:text-xs text-red-200 backdrop-blur-sm shadow-lg shadow-red-900/20 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3 rounded-2xl" />
            <div className="relative">
              <StudioRecentPanel
                videos={videos}
                ads={ads}
                meets={[]} // meets - COMING SOON
                onAdsUpdate={() => {
                  // Reload campaigns when status changes
                  fetchCampaigns();
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="fixed bottom-8 right-8 max-sm:bottom-4 max-sm:right-4 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex flex-col gap-3 max-sm:gap-2">
            <div className="w-12 h-12 max-sm:w-8 max-sm:h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="w-8 h-8 max-sm:w-6 max-sm:h-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
            <div className="w-6 h-6 max-sm:w-4 max-sm:h-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
