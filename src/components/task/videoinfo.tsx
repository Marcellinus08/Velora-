// src/components/task/videoinfo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AbstractProfile } from "@/components/abstract-profile";
import RecommendationPanel from "./recommendationpanel";
import ShareModal from "./share-modal";
import { toast } from "@/components/ui/toast";
import { useFollowButton } from "@/hooks/use-follow-button";
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
  isLocked = false,
  hideRecommendations = false,
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
  isLocked?: boolean;
  hideRecommendations?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // creator wallet lower
  const walletLower =
    typeof video.creator.wallet === "string"
      ? (video.creator.wallet.toLowerCase() as `0x${string}`)
      : ("" as `0x${string}`);

  // Use follow hook - will automatically check database and update state
  const { isFollowing, isLoading: followBusy, isSelf, handleFollow } = useFollowButton(walletLower);

  // like state (heart like seperti Community)
  const [likeCount, setLikeCount] = useState<number>(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  // share state untuk instant update
  const [isShared, setIsShared] = useState(hasShared);
  const [earnedSharePoints, setEarnedSharePoints] = useState(claimedSharePoints);
  const [shareBusy, setShareBusy] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // apakah user sedang melihat profil sendiri?
  const myAddr = useMemo(() => getAbstractAddressFromSession(), []);

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
      // Call API endpoint to handle like/unlike + notification creation
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddr: me.toLowerCase() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to toggle like");
      }

      const result = await response.json();
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (e: any) {
      console.error("Like toggle failed:", e);
      toast.error("Error", e.message || "Failed to toggle like", 3000);
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

  // Toggle follow/unfollow - use the hook's handleFollow function
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
    if (isSelf) {
      toast.info(
        "Not Allowed",
        "You cannot follow your own profile\nTry following other creators instead",
        4000
      );
      return;
    }

    // Call the hook's handleFollow which will handle the API calls
    try {
      await handleFollow();
      
      // Show success toast based on new state
      if (isFollowing) {
        toast.success("Success", `You've unfollowed ${video.creator.name}`, 3000);
      } else {
        toast.success(
          "Success",
          `You're now following ${video.creator.name}! 🎉`,
          3000
        );
      }
    } catch (e: any) {
      console.error("Follow toggle failed:", e);
      toast.error(
        "Follow Failed",
        `${e?.message || "Unknown error"}\nTry again later`,
        5000
      );
    }
  };

  return (
    <section className="col-span-12">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className={hideRecommendations ? "col-span-12" : "col-span-12 lg:col-span-8"}>
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
              {!isLocked && (
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
              )}

              {/* Share */}
              {!isLocked && (
                <button
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-neutral-50 transition-all duration-300 ${
                    isShared 
                      ? 'bg-green-900/30 border border-green-500/30 cursor-default' 
                      : shareBusy
                      ? 'bg-neutral-800 opacity-60 cursor-not-allowed'
                      : 'bg-neutral-800 hover:bg-neutral-700 hover:scale-[1.03] active:scale-95'
                  }`}
                  onClick={async () => {
                    // Jika sedang proses, tidak bisa klik
                    if (shareBusy) {
                      return;
                    }

                    setShareBusy(true);

                    // Award points untuk share (hanya sekali jika belum pernah share)
                    if (!isShared && userAddress && totalPoints > 0) {
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

                        if (response.ok) {
                          // Instant update UI - berubah jadi "Shared"
                          setIsShared(true);
                          setEarnedSharePoints(sharePoints);
                          toast.success("Share Success!", `You've earned ${sharePoints} points!`);
                        } else {
                          // Jika error (misalnya belum purchase), tetap bisa share tapi tidak dapat poin
                          console.log("Note:", data.error);
                          toast.info("Shared!", "Share successful, but no points awarded (video not purchased)");
                        }
                      } catch (error) {
                        console.error("Error awarding share points:", error);
                        toast.error("Error", "Failed to award points, but you can still share");
                      }
                    }

                    // Buka modal share
                    setShowShareModal(true);
                    setShareBusy(false);
                  }}
                  disabled={shareBusy}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="material-icons-round text-[16px] leading-none align-middle"
                      aria-hidden="true"
                    >
                      {shareBusy ? 'hourglass_empty' : isShared ? 'check_circle' : 'share'}
                    </span>
                    <span className="text-sm font-medium">
                      {shareBusy ? 'Sharing...' : isShared ? 'Shared' : 'Share'}
                    </span>
                  </div>
                  {sharePoints > 0 && (
                    <div className={`flex items-center gap-1.5 ml-2 pl-2 border-l ${
                      isShared ? 'border-green-600/30' : 'border-neutral-700'
                    }`}>
                      <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className={`text-sm font-medium ${
                        isShared ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {isShared ? `+${earnedSharePoints}` : sharePoints}
                      </span>
                    </div>
                  )}
                  {isShared && (
                    <span className="ml-2 text-xs text-green-400">Claimed</span>
                  )}
                </button>
              )}
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

            {/* Hide Follow button if viewing own video */}
            {!isSelf && (
              <button
                onClick={onToggleFollow}
                disabled={followBusy || !walletLower}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isFollowing
                    ? "bg-neutral-700 text-neutral-200 hover:bg-neutral-600 border border-neutral-600"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30"
                } ${followBusy ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {followBusy ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : isFollowing ? (
                  <>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
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

        {/* RIGHT: rekomendasi - hanya tampil jika tidak hideRecommendations */}
        {!hideRecommendations && (
          <aside className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
              <RecommendationPanel items={recommendations} />
            </div>
          </aside>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoTitle={video.title}
        videoUrl={typeof window !== "undefined" ? window.location.href : ""}
        totalPoints={sharePoints}
      />
    </section>
  );
}
