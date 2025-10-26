// src/app/subscription/page.tsx
"use client";

import Sidebar from "@/components/sidebar";
import { SubscriptionSection as Section } from "@/components/subscription/section";
import { SubscriptionVideoRow as VideoRow } from "@/components/subscription/videorow";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VideoItem = {
  purchaseId: string;
  purchasedAt: string;
  buyer: string;
  priceUsd: number;
  currency: string;
  status: string | null;
  tasksDone: boolean;
  id: string;                 // video id
  title: string;
  description?: string | null;
  category?: string | null;
  durationSeconds?: number;
  thumbUrl?: string;
  videoUrl?: string;
  creator?: string | null;
};

const isAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s || "");
const centsToUsd = (c?: number | null) => Math.max(0, Number(((c ?? 0) / 100).toFixed(2)));
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    isFinite(n) ? n : 0
  );

function toPayload(p: any, v: any): VideoItem {
  return {
    purchaseId: String(p.id),
    purchasedAt: String(p.created_at),
    buyer: String(p.buyer_id || ""),
    priceUsd: centsToUsd(p.price_cents),
    currency: p.currency || "USD",
    status: p.status || null,
    tasksDone: !!p.tasks_done,

    id: String(v?.id || p.video_id),
    title: String(v?.title ?? "Untitled"),
    description: v?.description ?? null,
    category: v?.category ?? null,
    durationSeconds: Number(v?.duration_seconds || 0),
    thumbUrl: v?.thumb_url || v?.thumb_path || "",
    videoUrl: v?.video_url || v?.video_path || "",
    creator: v?.abstract_id || null,
  };
}

export default function SubscriptionPage() {
  const { address } = useAccount();
  const buyer = (address ?? "").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [available, setAvailable] = useState<VideoItem[]>([]);
  const [completed, setCompleted] = useState<VideoItem[]>([]);

  // Add refresh on visibility change to catch updates from task page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && isAddr(buyer)) {
        // Refresh data when user returns to this page
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [buyer, loading]);

  useEffect(() => {
    let alive = true;

    async function loadViaApi(buyerAddr: string) {
      const r = await fetch(`/api/subcription/list?buyer=${buyerAddr}`, { cache: "no-store" });
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await r.text();
        throw new Error(`Unexpected response (not JSON): ${txt.slice(0, 120)}…`);
      }
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || r.statusText);
      return {
        available: Array.isArray(j.available) ? j.available : [],
        completed: Array.isArray(j.completed) ? j.completed : [],
      } as { available: VideoItem[]; completed: VideoItem[] };
    }

    async function loadDirectFromSupabase(buyerAddr: string) {
      let { data, error } = await supabase
        .from("video_purchases")
        .select(
          `
          id, created_at, buyer_id, video_id, tx_hash, price_cents, currency, tasks_done, status,
          videos!inner ( id, title, description, category, duration_seconds, thumb_url, thumb_path, video_url, video_path, abstract_id )
        `
        )
        .eq("buyer_id", buyerAddr)
        .order("created_at", { ascending: false });

      if (error || !data) {
        const { data: pchs, error: e1 } = await supabase
          .from("video_purchases")
          .select(
            "id, created_at, buyer_id, video_id, tx_hash, price_cents, currency, tasks_done, status"
          )
          .eq("buyer_id", buyerAddr)
          .order("created_at", { ascending: false });

        if (e1) throw e1;
        if (!pchs?.length) return { available: [], completed: [] };

        const ids = Array.from(new Set(pchs.map((p) => p.video_id)));
        const { data: vids, error: e2 } = await supabase
          .from("videos")
          .select(
            "id, title, description, category, duration_seconds, thumb_url, thumb_path, video_url, video_path, abstract_id"
          )
          .in("id", ids);

        if (e2) throw e2;

        const vmap = new Map<string, any>();
        (vids || []).forEach((v) => vmap.set(String(v.id), v));

        const rows = (pchs || []).map((p) => ({ ...p, videos: vmap.get(String(p.video_id)) || null }));
        data = rows as any;
      }

      // Fetch user progress untuk semua video yang dibeli
      const videoIds = Array.from(new Set((data || []).map(r => r.video_id)));
      const { data: progressData } = await supabase
        .from("user_video_progress")
        .select("video_id, has_completed_task, has_shared")
        .eq("user_addr", buyerAddr)
        .in("video_id", videoIds);

      const progressMap = new Map<string, any>();
      (progressData || []).forEach((p) => progressMap.set(p.video_id, p));

      const avail: VideoItem[] = [];
      const comp: VideoItem[] = [];

      for (const r of data || []) {
        const videoData = Array.isArray(r.videos) ? r.videos[0] : r.videos;
        const payload = toPayload(r, videoData || {});
        
        // Cek progress dari user_video_progress table
        const progress = progressMap.get(r.video_id);
        const hasCompletedTask = progress?.has_completed_task || false;
        const hasShared = progress?.has_shared || false;
        
        // Video completed jika user sudah mengerjakan task DAN sudah share
        const done = hasCompletedTask && hasShared;
        
        if (done) comp.push(payload);
        else avail.push(payload);
      }
      return { available: avail, completed: comp };
    }

    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (!isAddr(buyer)) {
          setAvailable([]);
          setCompleted([]);
          return;
        }

        let result: { available: VideoItem[]; completed: VideoItem[] };
        try {
          result = await loadViaApi(buyer);
        } catch {
          result = await loadDirectFromSupabase(buyer);
        }

        if (!alive) return;
        setAvailable(result.available);
        setCompleted(result.completed);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load subscriptions");
        setAvailable([]);
        setCompleted([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [buyer]);

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Subscription Management</h2>
          </div>

          {err && (
            <div className="rounded-md border border-red-800/60 bg-red-900/20 p-3 text-sm text-red-300">
              {err}
            </div>
          )}

          {/* Available */}
          <Section title="Available Videos">
            {loading ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-700/50" />
                <div className="mt-3 h-16 w-full animate-pulse rounded bg-neutral-800/60" />
              </div>
            ) : available.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 text-sm text-neutral-400">
                You haven’t purchased any videos yet.
              </div>
            ) : (
              available.map((v) => (
                <VideoRow
                  key={v.purchaseId}
                  videoId={v.id}
                  title={v.title}
                  thumb={v.thumbUrl || "/placeholder-thumb.png"}
                  subtext={`Purchased • ${fmtUSD(v.priceUsd)}`}
                  primaryAction={{ label: "Watch" }}
                />
              ))
            )}
          </Section>

          {/* Completed */}
          <Section title="Completed Videos">
            {loading ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-700/50" />
                <div className="mt-3 h-16 w-full animate-pulse rounded bg-neutral-800/60" />
              </div>
            ) : completed.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 text-sm text-neutral-400">
                No completed videos yet. Finish the tasks to move a video here.
              </div>
            ) : (
              completed.map((v) => (
                <VideoRow
                  key={v.purchaseId}
                  videoId={v.id}
                  title={v.title}
                  thumb={v.thumbUrl || "/placeholder-thumb.png"}
                  subtext={`Completed • ${fmtUSD(v.priceUsd)}`}
                  primaryAction={{ label: "Rewatch", variant: "secondary" }}
                />
              ))
            )}
          </Section>
        </div>
      </main>
    </div>
  );
}
