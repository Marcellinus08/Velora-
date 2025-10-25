"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import StudioHeader from "@/components/studio/header";
import StudioStats from "@/components/studio/stats";
import StudioActions from "@/components/studio/actions";
import StudioRecentPanel from "@/components/studio/recent";
import type { StudioVideo } from "@/components/studio/types";

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
  const [buyersTotal, setBuyersTotal] = useState(0);
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

      // Fetch buyers and earnings data from video_purchases
      await fetchStudioStats(items);
    } catch (e: any) {
      console.error("[studio page] load videos failed:", e);
      setError(e?.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudioStats(videoItems: StudioVideo[]) {
    if (!me || videoItems.length === 0) return;
    
    try {
      // Import supabase client
      const { supabase } = await import("@/lib/supabase");

      // Get all videos owned by this user directly from database
      const { data: myVideos, error: videosError } = await supabase
        .from("videos")
        .select("id, price_cents")
        .eq("abstract_id", me);

      console.log('[Studio Stats] My videos from DB:', myVideos);
      console.log('[Studio Stats] Videos error:', videosError);
      
      if (!myVideos || myVideos.length === 0) {
        console.log('[Studio Stats] No videos found for user:', me);
        setBuyersTotal(0);
        setEarningsUsd(0);
        return;
      }
      
      const videoIds = myVideos.map(v => v.id);
      
      console.log('[Studio Stats] Video IDs:', videoIds);

      // Fetch all purchases for these videos
      const { data: purchases, error: purchaseError } = await supabase
        .from("video_purchases")
        .select("buyer_id, video_id")
        .in("video_id", videoIds);

      console.log('[Studio Stats] Purchases:', purchases);
      console.log('[Studio Stats] Purchase Error:', purchaseError);

      if (purchases && purchases.length > 0) {
        // Count total purchases (not unique buyers)
        // If User A buys 3 videos = counted as 3 buyers
        const totalPurchases = purchases.length;
        console.log('[Studio Stats] Total Purchases:', totalPurchases);
        setBuyersTotal(totalPurchases);

        // Create price map
        const priceMap = new Map<string, number>();
        myVideos.forEach(v => {
          if (v.price_cents) priceMap.set(v.id, v.price_cents);
        });

        // Count buyers per video (purchases per video)
        const buyersPerVideo = new Map<string, number>();
        const revenuePerVideo = new Map<string, number>();

        purchases.forEach(p => {
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

        // Calculate total earnings
        const totalEarnings = Array.from(revenuePerVideo.values()).reduce((sum, rev) => sum + rev, 0);
        
        console.log('[Studio Stats] Buyers per video:', Array.from(buyersPerVideo.entries()));
        console.log('[Studio Stats] Revenue per video:', Array.from(revenuePerVideo.entries()));
        console.log('[Studio Stats] Total Earnings:', totalEarnings);
        setEarningsUsd(totalEarnings);
      } else {
        console.log('[Studio Stats] No purchases found');
        setBuyersTotal(0);
        setEarningsUsd(0);
      }
    } catch (error) {
      console.error("[Studio Stats] Error:", error);
      setBuyersTotal(0);
      setEarningsUsd(0);
    }
  }

  useEffect(() => {
    if (status === "connected" && me) void load();
  }, [status, me]);

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <StudioHeader />

        {/* Stats — contoh agregasi sederhana dari data yang ada */}
        <div className="mt-6">
          <StudioStats
            totals={{
              videos: videos.length,
              campaigns: 0,                 // belum ada data campaign di contoh
              buyers: buyersTotal,
              earningsUsd: earningsUsd,
            }}
          />
        </div>

        <div className="mt-6">
          <StudioActions />
        </div>

        <div className="mt-8">
          {error && (
            <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {loading ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-neutral-400">
              Loading…
            </div>
          ) : (
            <StudioRecentPanel
              // panelmu sudah menerima prop "videos" dan akan meneruskan ke StudioRecentUploads
              videos={videos}
              ads={[]} // belum ada
            />
          )}
        </div>
      </main>
    </div>
  );
}
