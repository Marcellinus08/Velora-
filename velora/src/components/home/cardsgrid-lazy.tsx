// src/components/home/cardsgrid-lazy.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { AbstractProfile } from "@/components/abstract-profile";
import { BuyVideoButton } from "@/components/payments/TreasuryButtons";
import { VideoCardSkeleton } from "@/components/skeletons/video-card-skeleton";

/* ================== Types ================== */
type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumb_url: string | null;
  price_cents?: number | null;
  currency?: string | null;
  points_total?: number | null;
  total_points?: number | null;
  creator?: {
    username: string | null;
    abstract_id: string | null;
    avatar_url: string | null;
  } | null;
};

const isAddressLike = (s?: string | null): s is `0x${string}` =>
  !!s && /^0x[a-fA-F0-9]{40}$/.test(s);

const shortId = (addr?: string | null) =>
  !addr ? "Unknown" : addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

/* ====== Session cache utk avatar Abstract (TTL 30m) ====== */
const TTL_MS = 30 * 60 * 1000;
function readCacheUrl(key: string): string | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > TTL_MS) return null;
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}
function writeCacheUrl(key: string, value: string) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {}
}
function readCacheMiss(key: string): boolean {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return false;
    const { t } = JSON.parse(raw);
    return Date.now() - t <= TTL_MS;
  } catch {
    return false;
  }
}
function writeCacheMiss(key: string) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: "MISS" }));
  } catch {}
}

/* Helpers */
const fmtUSD = (cents?: number | null) =>
  typeof cents === "number" && cents > 0 ? `$${(cents / 100).toFixed(2)}` : "Free";

const calcTotalPointsFromPrice = (priceCents?: number | null) =>
  Math.max(0, Math.round(((priceCents ?? 0) / 100) * 10));

const resolveTotalPoints = (row: VideoRow) => {
  if (typeof row.points_total === "number" && row.points_total > 0) return row.points_total;
  if (typeof row.total_points === "number" && row.total_points > 0) return row.total_points;
  return calcTotalPointsFromPrice(row.price_cents);
};

const isAddr = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s || "");

/* ================== Config ================== */
const ITEMS_PER_PAGE = 12;

/* ================== Grid ================== */
export default function CardsGridLazy() {
  const { address } = useAccount();
  const buyer = (address ?? "").toLowerCase();

  const [items, setItems] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [absAvatars, setAbsAvatars] = useState<Record<string, string>>({});
  const [absTried, setAbsTried] = useState<Record<string, boolean>>({});
  
  const inFlight = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);

  // 0) Ambil list kepemilikan video
  useEffect(() => {
    let alive = true;

    async function loadOwned(addrLower: string) {
      try {
        if (!isAddr(addrLower)) {
          if (alive) setOwned(new Set());
          return;
        }

        let ids: string[] = [];
        try {
          const r = await fetch(`/api/subscription/list?buyer=${addrLower}`, { cache: "no-store" });
          if (r.ok) {
            const j = await r.json();
            const a = Array.isArray(j?.available) ? j.available : [];
            const c = Array.isArray(j?.completed) ? j.completed : [];
            ids = [...a, ...c].map((x: any) => String(x?.id)).filter(Boolean);
          }
        } catch {
          /* fall through */
        }

        if (!ids.length) {
          const { data } = await supabase
            .from("video_purchases")
            .select("video_id,status")
            .eq("buyer_id", addrLower);
          const ok = (data || []).filter((r: any) => String(r?.status || "").toLowerCase() !== "refunded");
          ids = ok.map((r: any) => String(r.video_id)).filter(Boolean);
        }

        if (alive) setOwned(new Set(ids));
      } catch {
        if (alive) setOwned(new Set());
      }
    }

    loadOwned(buyer);
    return () => {
      alive = false;
    };
  }, [buyer]);

  // 1) Ambil initial videos
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        pageRef.current = 1;

        const selects = [
          `
            id, title, description, category, thumb_url,
            price_cents, currency, points_total,
            creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
          `,
          `
            id, title, description, category, thumb_url,
            price_cents, currency, total_points,
            creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
          `,
          `
            id, title, description, category, thumb_url,
            price_cents, currency,
            creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
          `,
        ];

        let data: any = null;
        let lastError: any = null;

        for (const sel of selects) {
          const { data: d, error } = await supabase
            .from("videos")
            .select(sel)
            .order("created_at", { ascending: false })
            .range(0, ITEMS_PER_PAGE - 1);
          if (!error) {
            data = d;
            break;
          }
          lastError = error;
        }

        if (!active) return;
        if (!data) throw lastError ?? new Error("Unknown error fetching videos");
        
        setItems(data as VideoRow[]);
        setHasMore(data.length >= ITEMS_PER_PAGE);
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

  // Load more videos - called by intersection observer
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      const selects = [
        `
          id, title, description, category, thumb_url,
          price_cents, currency, points_total,
          creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
        `,
        `
          id, title, description, category, thumb_url,
          price_cents, currency, total_points,
          creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
        `,
        `
          id, title, description, category, thumb_url,
          price_cents, currency,
          creator:profiles!videos_abstract_id_fkey(username, abstract_id, avatar_url)
        `,
      ];

      let data: any = null;
      let lastError: any = null;

      for (const sel of selects) {
        const { data: d, error } = await supabase
          .from("videos")
          .select(sel)
          .order("created_at", { ascending: false })
          .range(startIndex, endIndex);
        if (!error) {
          data = d;
          break;
        }
        lastError = error;
      }

      if (!data) throw lastError ?? new Error("Error loading more videos");

      setItems((prev) => [...prev, ...data as VideoRow[]]);
      pageRef.current = nextPage;
      setHasMore(data.length >= ITEMS_PER_PAGE);
    } catch (e: any) {
      console.error("Error loading more videos:", e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinel);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore]);

  // 2) Fetch avatar Abstract
  useEffect(() => {
    let alive = true;

    (async () => {
      const candidates = Array.from(
        new Set(
          items
            .filter((it) => !it.creator?.avatar_url)
            .map((it) => it.creator?.abstract_id?.toLowerCase() || "")
            .filter((addr): addr is string => !!addr)
        )
      );

      const need = candidates.filter((addr) => {
        if (absTried[addr]) return false;
        if (absAvatars[addr]) return false;
        if (inFlight.current.has(addr)) return false;

        const urlCached = readCacheUrl(`absavatar:${addr}`);
        const missCached = readCacheMiss(`absavatar-miss:${addr}`);
        if (urlCached) {
          setAbsAvatars((p) => ({ ...p, [addr]: urlCached }));
          setAbsTried((p) => ({ ...p, [addr]: true }));
          return false;
        }
        if (missCached) {
          setAbsTried((p) => ({ ...p, [addr]: true }));
          return false;
        }
        return true;
      });

      if (need.length === 0) return;

      need.forEach((a) => inFlight.current.add(a));

      const results = await Promise.all(
        need.map(async (addr) => {
          try {
            const r = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
            if (r.ok) {
              const j = await r.json();
              const url: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
              if (url) {
                writeCacheUrl(`absavatar:${addr}`, url);
                return [addr, url] as const;
              }
            }
          } catch {
            /* ignore */
          }
          writeCacheMiss(`absavatar-miss:${addr}`);
          return [addr, ""] as const;
        })
      );

      if (!alive) return;

      need.forEach((a) => inFlight.current.delete(a));

      setAbsTried((prev) => {
        const next = { ...prev };
        for (const [addr] of results) next[addr] = true;
        return next;
      });

      setAbsAvatars((prev) => {
        const next = { ...prev };
        for (const [addr, url] of results) if (url) next[addr] = url;
        return next;
      });
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, absTried]);

  /* ================== UI ================== */
  if (loading) {
    return (
      <div className="pt-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-neutral-800/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 rounded bg-neutral-800/60 animate-pulse" />
                <div className="h-4 w-56 rounded bg-neutral-800/60 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-32 rounded-full bg-neutral-800/60 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return <div className="pt-6 text-sm text-red-300">Failed to load videos: {err}</div>;
  }

  if (!items.length) {
    return (
      <div className="pt-6 text-center py-12">
        <p className="text-neutral-400">No videos available yet</p>
        <p className="text-neutral-500 text-sm mt-1">Check back later for new content!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Section Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <span className="text-base">🎬</span>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-neutral-100">Featured Videos</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 rounded-full bg-neutral-800/60 border border-neutral-700/50 px-3 py-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20">
              <span className="text-xs font-bold text-purple-400">{items.length}</span>
            </div>
            <span className="text-sm font-medium text-neutral-300">
              video{items.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
        
        <p className="text-sm text-neutral-400 mt-2">Discover amazing content</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8">
      {items.map((v) => {
        const addrLower = v.creator?.abstract_id?.toLowerCase() || "";
        const fetchedAbstract = addrLower ? absAvatars[addrLower] : "";
        const avatarSrc = v.creator?.avatar_url || fetchedAbstract || "";
        const author =
          v.creator?.username?.trim() || shortId(v.creator?.abstract_id) || "Unknown";
        const bg = v.thumb_url || "/placeholder-thumb.png";

        const priceText = fmtUSD(v.price_cents);
        const totalPoints = resolveTotalPoints(v);

        const priceUsd = Math.max(0, Number(((v.price_cents ?? 0) / 100).toFixed(2))) || 0;
        const creatorAddress = isAddressLike(addrLower) ? (addrLower as `0x${string}`) : undefined;
        const canBuy = priceUsd > 0 && !!creatorAddress;

        const isOwned = owned.has(String(v.id));

        return (
          <div
            key={v.id}
            className="group flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 transition-all duration-300 hover:shadow-lg hover:border-neutral-700 hover:scale-[1.01] transform"
          >
            {/* Elegant Thumbnail */}
            <div className="relative w-full overflow-hidden rounded-t-xl">
              {/* Points badge */}
              {totalPoints > 0 && (
                <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/85 px-2.5 py-1 text-xs font-semibold text-neutral-100 backdrop-blur">
                  <span
                    className="material-icons-round text-yellow-400 align-middle"
                    style={{ fontSize: "16px" }}
                    aria-hidden="true"
                  >
                    star
                  </span>
                  <span>{totalPoints}</span>
                </div>
              )}

              {/* Owned indicator */}
              {isOwned && (
                <div className="absolute right-2 top-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--primary-500)] text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div
                className="aspect-video w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url("${bg}")` }}
                aria-label={v.title}
              />
            </div>

            {/* Clean Info Section */}
            <div className="flex flex-1 flex-col gap-2 p-3 pb-4">
              <h3 className="text-base font-semibold leading-snug text-neutral-50 group-hover:text-[var(--primary-500)] transition-colors duration-200">
                {v.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <div className="h-6 w-6 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : addrLower ? (
                    <AbstractProfile address={addrLower as `0x${string}`} size="xs" showTooltip={false} className="!h-6 !w-6" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-500" fill="currentColor" aria-hidden="true">
                      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                    </svg>
                  )}
                </div>
                <span>{author}</span>
              </div>

              <div className="mt-auto flex items-end justify-between">
                <p className={`text-base font-bold ${isOwned ? "text-violet-300" : "text-neutral-50"}`}>
                  {isOwned ? "Owned" : priceText}
                </p>

                {/* Action Buttons */}
                {isOwned ? (
                  <Link href={`/video?id=${v.id}`} prefetch={false} className="relative z-10">
                    <button
                      type="button"
                      className="group relative inline-flex items-center gap-2 rounded-full bg-neutral-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-neutral-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900 cursor-pointer"
                      title="Watch this video"
                    >
                      <span className="material-icons-round text-[16px]" aria-hidden>
                        play_arrow
                      </span>
                      Watch
                    </button>
                  </Link>
                ) : canBuy ? (
                  <div className="relative z-10">
                    <BuyVideoButton
                      videoId={v.id}
                      creator={creatorAddress}
                      priceUsd={priceUsd}
                      className="group relative inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-purple-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 focus-visible:ring-offset-neutral-900 cursor-pointer"
                    >
                      Buy
                    </BuyVideoButton>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-700 px-4 py-2 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                    title={priceUsd <= 0 ? "Free video" : "Invalid creator address"}
                  >
                    {priceUsd <= 0 ? "Free" : "Buy"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className="h-10 mt-8 flex items-center justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-neutral-400">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-500" />
              <span className="text-sm">Loading more videos...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > ITEMS_PER_PAGE && (
        <div className="text-center py-8">
          <p className="text-neutral-500 text-sm">You've reached the end of the list</p>
        </div>
      )}
    </div>
  );
}
