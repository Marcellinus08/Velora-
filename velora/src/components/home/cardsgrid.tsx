"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AbstractProfile } from "@/components/abstract-profile";

/* ================== Types ================== */
type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumb_url: string | null;
  creator?: {
    username: string | null;
    abstract_id: string | null;
    avatar_url: string | null; // ambil dari DB
  } | null;
};

function shortId(addr?: string | null) {
  if (!addr) return "Unknown";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/* ====== Session cache utk avatar Abstract (TTL 30m) ====== */
const TTL_MS = 30 * 60 * 1000;
function readCache(key: string): string | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > TTL_MS) return null;
    return v as string;
  } catch {
    return null;
  }
}
function writeCache(key: string, value: string) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {}
}

/* ================== Grid ================== */
export default function CardsGrid() {
  const [items, setItems] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // peta addrLower -> avatarUrl (hasil fetch dari Abstract)
  const [absAvatars, setAbsAvatars] = useState<Record<string, string>>({});

  // 1) Ambil video + join profile (TERMASUK avatar_url)
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const { data, error } = await supabase
          .from("videos")
          .select(`
            id,
            title,
            description,
            category,
            thumb_url,
            creator:profiles!videos_abstract_id_fkey(
              username,
              abstract_id,
              avatar_url
            )
          `)
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

  // 2) Untuk yang avatar_url DB-nya kosong, fetch avatar dari Abstract 1x
  useEffect(() => {
    let alive = true;

    (async () => {
      const need = Array.from(
        new Set(
          items
            .filter((it) => !it.creator?.avatar_url)
            .map((it) => it.creator?.abstract_id?.toLowerCase() || "")
            .filter((addr): addr is string => !!addr)
            .filter((addr) => !absAvatars[addr])
        )
      );
      if (need.length === 0) return;

      const results = await Promise.all(
        need.map(async (addr) => {
          const key = `absavatar:${addr}`;
          const cached = readCache(key);
          if (cached) return [addr, cached] as const;

          try {
            const r = await fetch(`/api/abstract/user/${addr}`, {
              cache: "force-cache",
            });
            if (r.ok) {
              const j = await r.json();
              const url: string | null =
                j?.profilePicture || j?.avatar || j?.imageUrl || null;
              if (url) {
                writeCache(key, url);
                return [addr, url] as const;
              }
            }
          } catch {
            /* ignore */
          }
          return [addr, ""] as const; // gagal—biar tidak diulang-ulang
        })
      );

      if (!alive) return;
      setAbsAvatars((prev) => {
        const next = { ...prev };
        for (const [addr, url] of results) if (url) next[addr] = url;
        return next;
      });
    })();

    return () => {
      alive = false;
    };
  }, [items, absAvatars]);

  /* ================== UI ================== */
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
        const addrLower = v.creator?.abstract_id?.toLowerCase() || "";
        // urutan fallback: DB -> Abstract (fetched) -> AbstractProfile component
        const fetchedAbstract = addrLower ? absAvatars[addrLower] : "";
        const avatarSrc = v.creator?.avatar_url || fetchedAbstract || "";
        const author =
          v.creator?.username?.trim() ||
          shortId(v.creator?.abstract_id) ||
          "Unknown";
        const bg = v.thumb_url || "/placeholder-thumb.png";

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

              {/* Avatar + author */}
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <div className="h-6 w-6 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // jika URL dari Abstract gagal, fallback ke komponen AbstractProfile
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : addrLower ? (
                    <AbstractProfile
                      /* tampilkan avatar default Abstract untuk alamat creator */
                      // @ts-expect-error: komponen ini menerima props generik; abaikan typing custom
                      address={addrLower}
                      size="xs"
                      showTooltip={false}
                      className="!h-6 !w-6"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-neutral-500"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                    </svg>
                  )}
                </div>
                <span className="cursor-pointer">{author}</span>
              </div>

              {/* Aksi */}
              <div className="mt-auto flex items-center justify-between">
                <p className="text-base font-bold text-neutral-50">Free</p>
                <button
                  className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-opacity-80"
                  onClick={() => {
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
