"use client";

import { useEffect, useMemo, useState } from "react";
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

  if (!valid.length) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {valid.map((m, i) => (
        <div key={`${m.url}-${i}`} className="relative overflow-hidden rounded-lg border border-neutral-800">
          {m.mime?.startsWith?.("video/") ? (
            <video src={m.url} className="h-40 w-full object-cover" controls playsInline />
          ) : (
            <img src={m.url} className="h-40 w-full object-cover" alt="" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ===== Skeleton loading (sesuai gaya CardsGrid: animate-pulse kotak abu) ===== */
function PostSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start gap-4 animate-pulse">
        {/* avatar */}
        <div className="size-10 rounded-full bg-neutral-800/60" />

        {/* body */}
        <div className="flex-1">
          {/* header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded bg-neutral-800/60" />
              <div className="h-3 w-24 rounded bg-neutral-800/60" />
            </div>
            <div className="h-3 w-20 rounded bg-neutral-800/60" />
          </div>

          {/* title */}
          <div className="mt-2 h-5 w-2/3 rounded bg-neutral-800/60" />

          {/* content lines */}
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full rounded bg-neutral-800/60" />
            <div className="h-3 w-5/6 rounded bg-neutral-800/60" />
            <div className="h-3 w-4/6 rounded bg-neutral-800/60" />
          </div>

          {/* media thumb placeholders (opsional) */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 w-full rounded-lg bg-neutral-800/60" />
            ))}
          </div>

          {/* actions */}
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div className="h-4 w-20 rounded bg-neutral-800/60" />
            <div className="h-4 w-24 rounded bg-neutral-800/60" />
            <div className="h-4 w-16 rounded bg-neutral-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Komponen utama ===== */
export default function CommunityPostRow({
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

  /* ===== Share ke X ===== */
  const handleShare = () => {
    const text = `${post.title}\n\n${contentText.slice(0, 100)}\n`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text + (post.media?.[0]?.url ? post.media[0].url : "")
    )}`;
    window.open(intent, "_blank");
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

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {dbAvatar ? (
          <img
            src={dbAvatar}
            alt="author avatar"
            className="size-10 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = identicon;
            }}
          />
        ) : ETH_RE.test(addrLower) ? (
          <div className="size-10 overflow-hidden rounded-full">
            <AbstractProfile
              address={addrLower as `0x${string}`}
              size="sm"
              showTooltip={false}
              className="!h-10 !w-10 !rounded-full"
            />
          </div>
        ) : (
          <img src={identicon} alt="author avatar" className="size-10 rounded-full object-cover" />
        )}

        {/* Body */}
        <div className="flex-1">
          {/* HEADER: kiri (nama + kategori), kanan (waktu + menu) — sejajar rapi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-50">{displayName}</p>
              <p className="text-sm text-neutral-400">
                posted in <span className="font-medium text-neutral-50">{post.category}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-400">
              <span>{post.timeAgo}</span>
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-neutral-50 cursor-pointer">
                    <MI name="more_vert" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
                      <MI name="edit" className="mr-2" />
                      <span>Edit Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={requestDelete}
                      className="cursor-pointer text-red-500 focus:text-red-500 hover:text-red-400"
                    >
                      <MI name="delete" className="mr-2" />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* TITLE */}
          <h3 className="mt-2 text-lg font-bold text-neutral-50">{post.title}</h3>

          {/* CONTENT */}
          <div className="mt-1 text-neutral-400">
            {!expanded ? (
              <>
                {contentText.slice(0, 220)}
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
                <span className="whitespace-pre-wrap">{contentText}</span>{" "}
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
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-neutral-400">
            <button
              onClick={onLike}
              className={
                "flex items-center gap-1.5 hover:text-neutral-50 cursor-pointer " +
                (post.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
              }
            >
              <MI name={likeIcon} />
              <span>{post.likes} Likes</span>
            </button>

            <button
              onClick={() => setOpenReplies((v) => !v)}
              className="flex items-center gap-1.5 hover:text-neutral-50 cursor-pointer"
            >
              <MI name="chat_bubble_outline" />
              <span>{openReplies ? `Hide ${replyCount}` : replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-neutral-50 cursor-pointer">
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

          {openReplies && <Replies postId={post.id} onPosted={() => setReplyCount((c) => c + 1)} openReplyBox={openReplies} />}
        </div>
      </div>
    </div>
  );
}
