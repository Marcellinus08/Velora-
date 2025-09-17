"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumb_url: string | null;
  // alias "creator" hasil JOIN ke profiles via FK videos_abstract_id_fkey
  creator?: {
    username: string | null;
    abstract_id: string | null;
  } | null;
};

function shortId(addr?: string | null) {
  if (!addr) return "Unknown";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function CardsGrid() {
  const [items, setItems] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // Ambil video + join creator (profiles)
        // FK default biasanya bernama "videos_abstract_id_fkey"
        const { data, error } = await supabase
          .from("videos")
          .select(
            `
            id,
            title,
            description,
            category,
            thumb_url,
            creator:profiles!videos_abstract_id_fkey(
              username,
              abstract_id
            )
          `
          )
          .order("created_at", { ascending: false })
          .limit(24);

        if (error) throw error;
        if (!active) return;
        setItems(data ?? []);
      } catch (e: any) {
        if (!active) return;
        setErr(e?.message || "Failed to load videos.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8 pt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900"
          >
            <div className="aspect-video w-full rounded-t-xl bg-neutral-800/60" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded bg-neutral-800/60" />
              <div className="h-3 w-1/2 rounded bg-neutral-800/60" />
              <div className="mt-3 h-8 w-24 rounded-full bg-neutral-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <div className="pt-6 text-sm text-red-300">
        Failed to load videos: {err}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="pt-6 text-sm text-neutral-400">
        Belum ada video yang diupload.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8 pt-6">
      {items.map((v) => {
        const author =
          v.creator?.username?.trim() ||
          shortId(v.creator?.abstract_id) ||
          "Unknown";
        const bg = v.thumb_url || "/placeholder-thumb.png"; // optional fallback

        return (
          <div
            key={v.id}
            className="group flex flex-col rounded-xl bg-neutral-900"
          >
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden rounded-xl">
              <div
                className="aspect-video w-full cursor-pointer bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url("${bg}")` }}
                aria-label={v.title}
              />
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-2 p-2">
              <h3 className="cursor-pointer text-base font-semibold leading-snug text-neutral-50">
                {v.title}
              </h3>
              <p className="cursor-pointer text-sm font-normal text-neutral-400">
                {author}
              </p>

              {/* Aksi (tanpa harga, karena tidak dipakai) */}
              <div className="mt-auto flex items-center justify-between">
                <p className="text-base font-bold text-neutral-50">Free</p>
                <button
                  className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-opacity-80"
                  // TODO: arahkan ke halaman detail / watch
                  onClick={() => {
                    // contoh navigasi: /studio/watch/[id]
                    window.location.href = `/studio/video/${v.id}`;
                  }}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
