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

        // buyers & revenue: belum ada tabel orders di skema contoh -> biarkan undefined
        buyers: undefined,
        revenueUsd: undefined,
      }));

      setVideos(items);
    } catch (e: any) {
      console.error("[studio page] load videos failed:", e);
      setError(e?.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
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
              buyersTotal: videos.reduce((a, b) => a + (b.buyers ?? 0), 0),
              earningsUsd: videos.reduce((a, b) => a + (b.revenueUsd ?? 0), 0),
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
