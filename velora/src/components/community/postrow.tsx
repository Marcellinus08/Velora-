"use client";

import { useEffect, useMemo, useState } from "react";
import Replies from "./replies";
import type { CommunityPost } from "./types";
import { AbstractProfile } from "@/components/abstract-profile";

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

/* ===== Komponen utama ===== */
export default function CommunityPostRow({
  post,
  onLike,
  currentAddress,      // alamat wallet user yang login
  onDelete,            // callback hapus post (parent yang konfirmasi)
}: {
  post: CommunityPost;
  onLike?: () => void;
  currentAddress?: string;
  onDelete?: (postId: string) => void;
}) {
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
    if (post.media?.length) {
      const mediaUrl = post.media[0].url;
      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text}${mediaUrl}`)}`;
      window.open(intent, "_blank");
    } else {
      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(intent, "_blank");
    }
  };

  /* ===== Delete visibility: hanya pemilik ===== */
  const me = toLowerSafe(currentAddress);
  const authorByAddr = toLowerSafe(post.authorAddress);
  const authorByAbstract = toLowerSafe((post as any).abstractId || (post as any).abstract_id);
  const canDelete = !!me && (me === authorByAddr || me === authorByAbstract);

  // ⛔️ Tidak ada confirm() di sini — biar parent (SweetAlert) yang handle.
  const requestDelete = () => {
    if (onDelete) onDelete(post.id);
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-50">{displayName}</p>
              <p className="text-sm text-neutral-400">
                posted in <span className="font-medium text-neutral-50">{post.category}</span>
              </p>
            </div>
            <p className="text-sm text-neutral-400">{post.timeAgo}</p>
          </div>

          <h3 className="mt-2 text-lg font-bold text-neutral-50">{post.title}</h3>

          <div className="mt-1 text-neutral-400">
            {!expanded ? (
              <>
                {contentText.slice(0, 220)}
                {contentText.length > 220 ? "…" : ""}
                {showReadMore && (
                  <button
                    className="ml-1 inline text-[var(--primary-500)] hover:underline"
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
                  className="ml-1 inline text-[var(--primary-500)] hover:underline"
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
                "flex items-center gap-1.5 hover:text-neutral-50 " +
                (post.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
              }
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M14 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M10 4.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
              </svg>
              <span>{post.likes} Likes</span>
            </button>

            <button
              onClick={() => setOpenReplies((v) => !v)}
              className="flex items-center gap-1.5 hover:text-neutral-50"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{replyCount} Replies</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-neutral-50">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 10.895-1.789l-4.94 2.47a3.027 3.027 0 000-.74l-4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>

            {canDelete && onDelete && (
              <button
                onClick={requestDelete}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-400"
                title="Delete this post"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 3h6a1 1 0 011 1v1h4a1 1 0 110 2h-1.1l-1.2 12.1A3 3 0 0114.72 22H9.28a3 3 0 01-2.98-2.9L5.1 7H4a1 1 0 110-2h4V4a1 1 0 011-1zm-1.9 4l1.1 11.1A1 1 0 009.28 19h5.44a1 1 0 001-.9L16.9 7H7.1z" />
                </svg>
                <span>Delete</span>
              </button>
            )}
          </div>

          {openReplies && <Replies postId={post.id} onPosted={() => setReplyCount((c) => c + 1)} />}
        </div>
      </div>
    </div>
  );
}
