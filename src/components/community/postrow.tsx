"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Image from "next/image";
import Replies from "./replies";
import type { CommunityPost } from "./types";
import { AbstractProfile } from "@/components/abstract-profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditModal } from "./editmodal";
import CommunityShareModal from "./share-modal";

/* ===== utils kecil ===== */
const TTL = 5 * 60_000;
const readCache = <T,>(k: string): T | null => {
  try {
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > TTL) return null;
    return v as T;
  } catch {
    return null;
  }
};
const writeCache = <T,>(k: string, v: T) => {
  try {
    sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v }));
  } catch {}
};
const short = (a?: string) =>
  a && a.startsWith("0x") && a.length >= 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "-";
const ETH_RE = /^0x[a-f0-9]{40}$/;
const isPlaceholder = (u?: string | null) => !u || /dicebear\.com/i.test(u);
const toLowerSafe = (s?: string | null) => (typeof s === "string" ? s.toLowerCase() : "");

/** Ambil avatar dari DB; Abstract dipakai via komponen */
function useDbAvatar(address?: string, initial?: string | null) {
  const addr = useMemo(() => toLowerSafe(address), [address]);
  const [src, setSrc] = useState<string | null>(initial && !isPlaceholder(initial) ? initial : null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ETH_RE.test(addr)) return;
      if (!src || isPlaceholder(src)) {
        const ck = `dbprof:${addr}`;
        let prof = readCache<{ username: string | null; avatar_url: string | null }>(ck);
        if (!prof) {
          try {
            const r = await fetch(`/api/profiles/${addr}`, { cache: "force-cache" });
            if (r.ok) {
              const j = await r.json();
              prof = { username: j?.username ?? null, avatar_url: j?.avatar_url ?? null };
              writeCache(ck, prof);
            }
          } catch {}
        }
        if (alive && prof?.avatar_url && !isPlaceholder(prof.avatar_url)) {
          setSrc(prof.avatar_url);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr, initial, src]);

  return src;
}

/* ===== Grid media, skip yang 404 ===== */
function MediaGrid({ media }: { media?: { url: string; mime?: string | null }[] }) {
  if (!media || !media.length) return null;

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  async function headOk(url: string) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok;
    } catch {
      return false;
    }
  }

  const [valid, setValid] = useState<{ url: string; mime?: string | null }[]>([]);
  useEffect(() => {
    let alive = true;
    Promise.all(media.map(async (m) => ((await headOk(m.url)) ? m : null))).then((arr) => {
      if (!alive) return;
      setValid(arr.filter(Boolean) as { url: string; mime?: string | null }[]);
    });
    return () => {
      alive = false;
    };
  }, [media]);

  // Add ESC key handler for fullscreen exit on mobile/tablet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!valid.length) return null;
  
  // Helper to detect if file is video based on extension when mime is null
  const isVideo = (m: { url: string; mime?: string | null }) => {
    if (m.mime?.startsWith?.("video/")) return true;
    // Fallback: check file extension
    const ext = m.url.split('.').pop()?.toLowerCase();
    return ext && ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'm4v'].includes(ext);
  };
  
  return (
    <>
      <div className="mt-3 max-sm:mt-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-2 max-sm:gap-2 md:gap-2 w-full">
        {valid.map((m, i) => (
          <div key={`${m.url}-${i}`} className="relative overflow-hidden rounded-lg max-sm:rounded-md border border-neutral-800 md:rounded-lg group">
            {isVideo(m) ? (
              <>
                <video 
                  id={`video-${i}`}
                  src={m.url} 
                  className="h-48 sm:h-56 md:h-56 xl:h-64 2xl:h-40 w-full object-cover" 
                  controls 
                  playsInline 
                  preload="metadata"
                  controlsList="nodownload"
                  onKeyDown={(e) => {
                    // Allow ESC to exit fullscreen on mobile/tablet
                    if (e.key === 'Escape' && document.fullscreenElement) {
                      document.exitFullscreen();
                    }
                  }}
                />
              </>
            ) : (
              <div 
                className="h-48 sm:h-56 md:h-56 xl:h-64 2xl:h-40 w-full cursor-pointer hover:opacity-90 transition-opacity relative"
                onClick={() => setLightboxImage(m.url)}
              >
                <Image 
                  src={m.url} 
                  alt="Post media" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  loading="lazy"
                  quality={75}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-[101] rounded-full bg-neutral-800/80 p-2 text-white hover:bg-neutral-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={lightboxImage}
              alt="Full size"
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ===== Skeleton loading (sesuai gaya CardsGrid: animate-pulse kotak abu) ===== */
function PostSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 max-sm:p-3 max-sm:rounded-md max-sm:w-full max-sm:overflow-hidden md:p-4 md:rounded-lg">
      <div className="flex items-start gap-4 max-sm:gap-2.5 animate-pulse max-sm:w-full md:gap-3.5">
        {/* avatar */}
        <div className="size-10 max-sm:size-8 rounded-full bg-neutral-800/60 md:size-10" />

        {/* body */}
        <div className="flex-1">
          {/* header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-sm:gap-1.5 md:gap-2">
              <div className="h-4 max-sm:h-3 w-28 max-sm:w-20 rounded bg-neutral-800/60 md:h-4 md:w-28" />
              <div className="h-3 max-sm:h-2.5 w-24 max-sm:w-16 rounded bg-neutral-800/60 md:h-3 md:w-24" />
            </div>
            <div className="h-3 max-sm:h-2.5 w-20 max-sm:w-14 rounded bg-neutral-800/60 md:h-3 md:w-20" />
          </div>

          {/* title */}
          <div className="mt-2 max-sm:mt-1.5 h-5 max-sm:h-4 w-2/3 max-sm:w-4/5 rounded bg-neutral-800/60 md:mt-2 md:h-5" />

          {/* content lines */}
          <div className="mt-2 max-sm:mt-1.5 space-y-2 max-sm:space-y-1.5 md:mt-2 md:space-y-2">
            <div className="h-3 max-sm:h-2.5 w-full rounded bg-neutral-800/60 md:h-3" />
            <div className="h-3 max-sm:h-2.5 w-5/6 rounded bg-neutral-800/60 md:h-3" />
            <div className="h-3 max-sm:h-2.5 w-4/6 rounded bg-neutral-800/60 md:h-3" />
          </div>

          {/* media thumb placeholders (opsional) */}
          <div className="mt-3 max-sm:mt-2 grid grid-cols-2 gap-2 max-sm:gap-1.5 sm:grid-cols-3 md:grid-cols-4 max-sm:w-full max-sm:overflow-hidden md:mt-3 md:gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 max-sm:h-24 w-full rounded-lg max-sm:rounded-md bg-neutral-800/60 md:h-40 md:rounded-lg" />
            ))}
          </div>

          {/* actions */}
          <div className="mt-4 max-sm:mt-3 flex flex-wrap items-center gap-6 max-sm:gap-4 md:mt-4 md:gap-6">
            <div className="h-4 max-sm:h-3 w-20 max-sm:w-16 rounded bg-neutral-800/60 md:h-4 md:w-20" />
            <div className="h-4 max-sm:h-3 w-24 max-sm:w-20 rounded bg-neutral-800/60 md:h-4 md:w-24" />
            <div className="h-4 max-sm:h-3 w-16 max-sm:w-12 rounded bg-neutral-800/60 md:h-4 md:w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Komponen utama ===== */
const CommunityPostRow = memo(function CommunityPostRow({
  post,
  onLike,
  currentAddress, // alamat wallet user yang login
  onDelete, // callback hapus post (parent yang konfirmasi)
  loading = false, // <<— PROP BARU
  onEdit, // callback untuk edit post
}: {
  post: CommunityPost;
  onLike?: () => void;
  currentAddress?: string;
  onDelete?: (postId: string) => void;
  onEdit?: (data: { postId: string; title: string; content: string }) => Promise<void>;
  loading?: boolean;
}) {
  // Tampilkan skeleton ketika loading
  if (loading) return <PostSkeleton />;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);
  const [replyCount, setReplyCount] = useState<number>(post.replies ?? 0);

  const displayName = (post.authorName && post.authorName.trim()) || short(post.authorAddress);

  const dbAvatar = useDbAvatar(post.authorAddress, post.authorAvatar || null);
  const addrLower = toLowerSafe(post.authorAddress);
  const identicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${addrLower || "anon"}`;

  const contentText = post.content || post.excerpt || "";
  const showReadMore = contentText.length > 220;

  /* ===== Share Modal ===== */
  const [showShareModal, setShowShareModal] = useState(false);
  const handleShare = () => {
    setShowShareModal(true);
  };

  /* ===== Delete visibility: hanya pemilik ===== */
  const me = toLowerSafe(currentAddress);
  const authorByAddr = toLowerSafe(post.authorAddress);
  const authorByAbstract = toLowerSafe((post as any).abstractId || (post as any).abstract_id);
  const canDelete = !!me && (me === authorByAddr || me === authorByAbstract);

  const requestDelete = () => {
    if (onDelete) onDelete(post.id);
  };

  // helper ikon Material (Round) — kecil & rapi baseline
  const MI = ({ name, className = "" }: { name: string; className?: string }) => (
    <span
      className={`material-icons-round text-[6px] leading-none align-middle relative top-[1px] ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );

  // pilih ikon Like tergantung status (outline vs filled heart)
  const likeIcon = post.liked ? "favorite" : "favorite_border";

  // Helper function to convert URLs in text to clickable links
  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary-500)] hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 max-sm:p-3 max-sm:rounded-md transition-colors hover:bg-neutral-800 max-sm:w-[calc(100vw-2rem)] sm:w-full md:p-4 md:rounded-lg">
      <div className="flex items-start gap-4 max-sm:gap-2.5 md:gap-3.5">
        {/* Avatar */}
        {dbAvatar ? (
          <Image
            src={dbAvatar}
            alt="author avatar"
            width={40}
            height={40}
            className="size-10 max-sm:size-8 rounded-full object-cover md:size-10"
            loading="lazy"
            quality={80}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = identicon;
            }}
          />
        ) : ETH_RE.test(addrLower) ? (
          <div className="size-10 max-sm:size-8 overflow-hidden rounded-full md:size-10">
            <AbstractProfile
              address={addrLower as `0x${string}`}
              size="sm"
              showTooltip={false}
              className="!h-10 !w-10 max-sm:!h-8 max-sm:!w-8 !rounded-full md:!h-10 md:!w-10"
            />
          </div>
        ) : (
          <Image src={identicon} alt="author avatar" width={40} height={40} className="size-10 max-sm:size-8 rounded-full object-cover md:size-10" loading="lazy" />
        )}

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* HEADER: kiri (nama + kategori), kanan (waktu + menu) — sejajar rapi */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5 max-sm:gap-0 sm:flex-row sm:items-center sm:gap-2 flex-1 min-w-0 md:flex-row md:items-center md:gap-2">
              <p className="font-semibold text-neutral-50 max-sm:text-sm truncate md:text-base">{displayName}</p>
              <p className="text-xs max-sm:text-xs text-neutral-400 truncate sm:text-xs md:text-xs">
                posted in <span className="font-medium text-neutral-50">{post.category}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm max-sm:text-xs text-neutral-400 flex-shrink-0 md:text-sm">
              <span className="max-sm:hidden">{post.timeAgo}</span>
              <span className="hidden max-sm:inline text-[10px]">{post.timeAgo}</span>
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-neutral-50 cursor-pointer">
                    <MI name="more_vert" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
                      <MI name="edit" className="mr-2 text-[14px]" />
                      <span>Edit Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={requestDelete}
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      <MI name="delete" className="mr-2 text-[14px]" />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* TITLE */}
          <h3 className="mt-2 max-sm:mt-1.5 text-lg max-sm:text-base font-bold text-neutral-50 break-words md:mt-2 md:text-lg">{post.title}</h3>

          {/* CONTENT */}
          <div className="mt-1 max-sm:text-sm text-neutral-400 break-words md:text-base">
            {!expanded ? (
              <>
                {linkifyText(contentText.slice(0, 220))}
                {contentText.length > 220 ? "…" : ""}
                {showReadMore && (
                  <button
                    className="ml-1 inline text-[var(--primary-500)] hover:underline cursor-pointer"
                    onClick={() => setExpanded(true)}
                  >
                    Read more
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="whitespace-pre-wrap">{linkifyText(contentText)}</span>{" "}
                <button
                  className="ml-1 inline text-[var(--primary-500)] hover:underline cursor-pointer"
                  onClick={() => setExpanded(false)}
                >
                  Show less
                </button>
              </>
            )}
          </div>

          {/* Media */}
          <MediaGrid media={post.media} />

          {/* Actions */}
          <div className="mt-4 max-sm:mt-3 flex flex-wrap items-center gap-6 max-sm:gap-4 text-sm max-sm:text-xs text-neutral-400 md:mt-4 md:gap-6 md:text-sm">
            <button
              onClick={onLike}
              className={
                "flex items-center gap-1.5 max-sm:gap-1 hover:text-neutral-50 cursor-pointer md:gap-1.5 " +
                (post.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
              }
            >
              <MI name={likeIcon} />
              <span>{post.likes} Likes</span>
            </button>

            <button
              onClick={() => setOpenReplies((v) => !v)}
              className="flex items-center gap-1.5 max-sm:gap-1 hover:text-neutral-50 cursor-pointer md:gap-1.5"
            >
              <MI name="chat_bubble_outline" />
              <span>{openReplies ? `Hide ${replyCount}` : replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 max-sm:gap-1 hover:text-neutral-50 cursor-pointer md:gap-1.5">
              <MI name="share" />
              <span>Share</span>
            </button>
          </div>

          {/* Edit Modal */}
          {canDelete && onEdit && (
            <EditModal
              post={post}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={async (data) => {
                await onEdit({
                  postId: post.id,
                  title: data.title,
                  content: data.content
                });
              }}
            />
          )}

          {/* Share Modal */}
          <CommunityShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            postTitle={post.title}
            postContent={contentText}
            postUrl={typeof window !== "undefined" ? `${window.location.origin}/community?postId=${post.id}` : ""}
            mediaUrl={post.media?.[0]?.url}
            allMedia={post.media}
          />

          {openReplies && <Replies postId={post.id} onPosted={() => setReplyCount((c) => c + 1)} openReplyBox={openReplies} />}
        </div>
      </div>
    </div>
  );
});

export default CommunityPostRow;
