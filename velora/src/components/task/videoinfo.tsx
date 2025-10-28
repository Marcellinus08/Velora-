// src/components/task/videoinfo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AbstractProfile } from "@/components/abstract-profile";
import RecommendationPanel from "./recommendationpanel";
import { toast } from "@/components/ui/toast";
import type { VideoInfo, RecommendedVideo } from "./types";

/* ================= Helpers ================= */
function FallbackInitial({ name }: { name: string }) {
  const initial = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <div className="grid h-12 w-12 place-items-center rounded-full bg-neutral-800 text-lg font-bold text-neutral-200 ring-2 ring-neutral-700/60">
      {initial}
    </div>
  );
}

/** Ambil alamat wallet dari localStorage (wagmi / Abstract). */
function getAbstractAddressFromSession(): `0x${string}` | null {
  try {
    const rawWagmi = localStorage.getItem("wagmi.store");
    if (rawWagmi) {
      const m = rawWagmi.match(/0x[a-fA-F0-9]{40}/);
      if (m && m[0]) return m[0].toLowerCase() as `0x${string}`;
    }
    const rawAbs = localStorage.getItem("abstract:session");
    if (rawAbs) {
      const m = rawAbs.match(/0x[a-fA-F0-9]{40}/);
      if (m && m[0]) return m[0].toLowerCase() as `0x${string}`;
    }
    const rawDirect = localStorage.getItem("abstract_id") || localStorage.getItem("wallet");
    if (rawDirect) {
      const m = rawDirect.match(/0x[a-fA-F0-9]{40}/);
      if (m && m[0]) return m[0].toLowerCase() as `0x${string}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function cn(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ================ Component ================ */
export default function VideoInfoSection({
  video,
  recommendations,
  videoId,
  initialLikes = 0,
  sharePoints = 0,
  totalPoints = 0,
  userAddress,
  hasShared = false,
  claimedSharePoints = 0,
}: {
  video: VideoInfo;
  recommendations: RecommendedVideo[];
  videoId: string;
  initialLikes?: number;
  sharePoints?: number;
  totalPoints?: number;
  userAddress?: string;
  hasShared?: boolean;
  claimedSharePoints?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  // like state (heart like seperti Community)
  const [likeCount, setLikeCount] = useState<number>(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // creator wallet lower
  const walletLower =
    typeof video.creator.wallet === "string"
      ? (video.creator.wallet.toLowerCase() as `0x${string}`)
      : ("" as `0x${string}`);

  // apakah user sedang melihat profil sendiri?
  const myAddr = useMemo(() => getAbstractAddressFromSession(), []);
  const isSelf = !!myAddr && !!walletLower && myAddr === walletLower;

  // Cek status mengikuti saat mount/pada perubahan wallet creator
  useEffect(() => {
    let active = true;
    (async () => {
      if (!walletLower) return;
      const me = getAbstractAddressFromSession();
      if (!me) return;

      const { count, error } = await supabase
        .from("profiles_follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_addr", me)
        .eq("followee_addr", walletLower);

      if (!active) return;
      if (!error) setIsFollowing((count || 0) > 0);
    })();

    return () => {
      active = false;
    };
  }, [walletLower]);

  // ===== Like loader (count + liked-by-me)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // count
        const { count } = await supabase
          .from("video_likes")
          .select("*", { head: true, count: "exact" })
          .eq("video_id", videoId);
        if (alive) setLikeCount(count ?? initialLikes ?? 0);

        // liked-by-me
        const me = getAbstractAddressFromSession();
        if (!me) {
          if (alive) setLiked(false);
          return;
        }
        const { data } = await supabase
          .from("video_likes")
          .select("id")
          .eq("video_id", videoId)
          .eq("user_addr", me.toLowerCase())
          .maybeSingle();
        if (alive) setLiked(!!data);
      } catch {
        // keep initial
      }
    })();
    return () => {
      alive = false;
    };
  }, [videoId, initialLikes]);

  // ===== Toggle like (heart)
  const onToggleLikeVideo = async () => {
    const me = getAbstractAddressFromSession();
    if (!me) {
      toast.error(
        "Login Required",
        "Please connect your wallet to like this video\nSign in to interact with content",
        5000
      );
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      if (!liked) {
        await supabase
          .from("video_likes")
          .upsert([{ video_id: videoId, user_addr: me.toLowerCase() }], {
            onConflict: "video_id,user_addr",
          });
        setLiked(true);
      } else {
        await supabase.from("video_likes").delete().eq("video_id", videoId).eq("user_addr", me.toLowerCase());
        setLiked(false);
      }
      const { count } = await supabase
        .from("video_likes")
        .select("*", { head: true, count: "exact" })
        .eq("video_id", videoId);
      setLikeCount(count ?? 0);

      // Optional: sinkronkan aggregate tabel videos
      await supabase.from("videos").update({ likes_count: count ?? 0 }).eq("id", videoId);
    } finally {
      setLikeBusy(false);
    }
  };

  // helper ikon Material (round) – sama seperti Community
  const MI = ({ name, className = "" }: { name: string; className?: string }) => (
    <span
      className={`material-icons-round text-[16px] leading-none align-middle ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
  const likeIcon = liked ? "favorite" : "favorite_border";

  // Toggle follow/unfollow
  const onToggleFollow = async () => {
    const me = getAbstractAddressFromSession();
    if (!me) {
      toast.error(
        "Login Required",
        "Please connect your wallet to follow this creator\nSign in to start following",
        5000
      );
      return;
    }
    if (!walletLower) return;
    if (me === walletLower) {
      toast.info(
        "Not Allowed",
        "You cannot follow your own profile\nTry following other creators instead",
        4000
      );
      return;
    }

    setFollowBusy(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("profiles_follows")
          .delete()
          .eq("follower_addr", me)
          .eq("followee_addr", walletLower);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase.from("profiles_follows").insert({
          follower_addr: me,
          followee_addr: walletLower,
        });
        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (e: any) {
      console.error("Follow toggle failed:", e);
      toast.error(
        "Follow Failed",
        `Error: ${e?.message || "Unknown error"}\nFailed to update follow status`,
        5000
      );
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <section className="col-span-12">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 lg:col-span-8">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug text-neutral-50">
            {video.title}
          </h1>

          {/* actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <span>{video.views}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-600" />
              <span>Streaming</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Heart like ala Community */}
              <button
                onClick={onToggleLikeVideo}
                disabled={likeBusy}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
                  liked
                    ? "text-[var(--primary-500)] border-[var(--primary-500)]/40 bg-violet-900/20"
                    : "text-neutral-200 border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700",
                  likeBusy ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.03] active:scale-95",
                ].join(" ")}
                title={liked ? "Unlike" : "Like"}
              >
                <MI name={likeIcon} />
                <span>{likeCount}</span>
              </button>

              {/* Share */}
              <button
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-neutral-50 transition-colors ${
                  hasShared 
                    ? 'bg-green-900/30 border border-green-500/30 cursor-default' 
                    : 'bg-neutral-800 hover:bg-neutral-700'
                }`}
                onClick={async () => {
                  // Jika sudah pernah share, tidak bisa claim lagi
                  if (hasShared) {
                    return;
                  }

                  // Award points untuk share (hanya sekali)
                  if (userAddress && totalPoints > 0) {
                    try {
                      const response = await fetch("/api/user-progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userAddr: userAddress.toLowerCase(),
                          videoId,
                          action: "share",
                          totalPoints,
                        }),
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        // Jika error (misalnya belum purchase), tetap bisa share tapi tidak dapat poin
                        console.log("Note:", data.error);
                      }
                    } catch (error) {
                      console.error("Error awarding share points:", error);
                    }
                  }

                  // Share to Twitter/X (tetap bisa share meskipun sudah pernah)
                  const pointsText = totalPoints > 0 ? ` and get total ${totalPoints} points!` : '!';
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  const text = `Check out this video: ${video.title}${pointsText}\n\n${url}\n\n@AbstractChain`;
                  const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                  window.open(twitterIntent, "_blank");
                }}
                disabled={hasShared}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-icons-round text-[16px] leading-none align-middle"
                    aria-hidden="true"
                  >
                    {hasShared ? 'check_circle' : 'share'}
                  </span>
                  <span className="text-sm font-medium">{hasShared ? 'Shared' : 'Share'}</span>
                </div>
                {sharePoints > 0 && (
                  <div className={`flex items-center gap-1.5 ml-2 pl-2 border-l ${
                    hasShared ? 'border-green-600/30' : 'border-neutral-700'
                  }`}>
                    <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className={`text-sm font-medium ${
                      hasShared ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {hasShared ? `+${claimedSharePoints}` : sharePoints}
                    </span>
                  </div>
                )}
                {hasShared && (
                  <span className="ml-2 text-xs text-green-400">Claimed</span>
                )}
              </button>
            </div>
          </div>

          {/* CREATOR */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-neutral-700/60 bg-neutral-800">
                {video.creator.avatar ? (
                  <Image
                    src={video.creator.avatar}
                    alt={`${video.creator.name} avatar`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as any).style.display = "none";
                    }}
                  />
                ) : walletLower ? (
                  <AbstractProfile
                    address={walletLower}
                    size="md"
                    showTooltip={false}
                    className="!h-12 !w-12"
                  />
                ) : (
                  <FallbackInitial name={video.creator.name} />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-50">{video.creator.name}</p>
                <p className="text-sm text-neutral-400">{video.creator.followers}</p>
              </div>
            </div>

            <button
              onClick={onToggleFollow}
              disabled={followBusy || isSelf || !walletLower}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed",
                isFollowing
                  ? "bg-neutral-700 text-neutral-100 hover:bg-neutral-600"
                  : "bg-[var(--primary-500)] text-white hover:bg-violet-600"
              )}
              title={isSelf ? "You cannot follow yourself" : undefined}
            >
              {isFollowing ? (followBusy ? "…" : "Following") : followBusy ? "…" : "Follow"}
            </button>
          </div>

          {/* Description */}
          <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-300">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 00-2 2v10l3-2 3 2 3-2 3 2V5a2 2 0 00-2-2H4z" />
              </svg>
              Description
            </div>

            <p
              className="text-sm leading-relaxed text-neutral-200"
              style={
                expanded
                  ? undefined
                  : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }
              }
            >
              {video.description}
            </p>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-neutral-300 hover:text-neutral-100"
            >
              {expanded ? "Show less" : "Show more"}
            </button>

            {!!video.tags?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {video.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs text-neutral-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: rekomendasi */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <RecommendationPanel items={recommendations} />
          </div>
        </aside>
      </div>
    </section>
  );
}
