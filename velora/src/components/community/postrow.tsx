"use client";

import { useEffect, useMemo, useState } from "react";
import Replies from "./replies";
import type { CommunityPost } from "./types";

/* ========== utils & cache kecil (5 menit) ========== */
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
const isAddr = (a?: string) => !!a && /^0x[a-f0-9]{40}$/.test(a.toLowerCase());
const isPlaceholder = (u?: string | null) =>
  !u || u.toLowerCase().includes("dicebear.com") || u.toLowerCase().includes("placeholder");

/* ========== hook: ambil avatar by address (DB → Abstract → identicon) ========== */
function useAddressAvatar(address?: string, initial?: string | null) {
  const addr = useMemo(() => (address ? address.toLowerCase() : ""), [address]);
  const [src, setSrc] = useState<string | null>(initial && !isPlaceholder(initial) ? initial : null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAddr(addr)) return;

      // 1) jika sudah punya src valid, stop
      if (src && !isPlaceholder(src)) return;

      // 2) coba profile DB (cached)
      const ckProf = `dbprof:${addr}`;
      let prof = readCache<{ username: string | null; avatar_url: string | null }>(ckProf);
      if (!prof) {
        try {
          const r = await fetch(`/api/profiles/${addr}`, { cache: "force-cache" });
          if (r.ok) {
            const j = await r.json();
            prof = { username: j?.username ?? null, avatar_url: j?.avatar_url ?? null };
            writeCache(ckProf, prof);
          }
        } catch {}
      }
      if (alive && prof?.avatar_url && !isPlaceholder(prof.avatar_url)) {
        setSrc(`${prof.avatar_url}`); // tambahkan `?v=${Date.now()}` bila perlu bypass cache
        return;
      }

      // 3) fallback ke Abstract (cached)
      const ckAbs = `absavatar:${addr}`;
      let abs = readCache<string>(ckAbs);
      if (!abs) {
        try {
          const r = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
          if (r.ok) {
            const j = await r.json();
            abs =
              j?.profilePicture ||
              j?.avatar ||
              j?.imageUrl ||
              j?.image ||
              j?.pfp ||
              j?.pfpUrl ||
              j?.photoURL ||
              null;
            if (abs) writeCache(ckAbs, abs);
          }
        } catch {}
      }
      if (alive && abs && !isPlaceholder(abs)) {
        setSrc(abs);
        return;
      }

      // 4) terakhir: identicon
      if (alive) setSrc(`https://api.dicebear.com/7.x/identicon/svg?seed=${addr || "anon"}`);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr, initial]);

  return src;
}

/* ========== UI ========== */
export default function CommunityPostRow({
  post,
  onLike,
}: {
  post: CommunityPost;
  onLike?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);
  const [replyCount, setReplyCount] = useState<number>(post.replies ?? 0);

  const displayName =
    (post.authorName && post.authorName.trim()) || short(post.authorAddress);
  const avatarSrc = useAddressAvatar(post.authorAddress, post.authorAvatar || null);

  const showReadMore = (post.content ?? post.excerpt ?? "").length > 220;
  const addrLower = (post.authorAddress || "").toLowerCase();
  const identicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${addrLower || "anon"}`;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800">
      <div className="flex items-start gap-4">
        <img
          src={avatarSrc ?? identicon} // ← tidak pernah kosong
          alt="author avatar"
          className="size-10 rounded-full object-cover"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== identicon) el.src = identicon; // hindari loop
          }}
        />

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
                {post.excerpt ?? (post.content || "")}{" "}
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
                <span className="whitespace-pre-wrap">{post.content || post.excerpt}</span>{" "}
                <button
                  className="ml-1 inline text-[var(--primary-500)] hover:underline"
                  onClick={() => setExpanded(false)}
                >
                  Show less
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-neutral-400">
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

            <button className="flex items-center gap-1.5 hover:text-neutral-50" disabled>
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>

          {openReplies && (
            <Replies postId={post.id} onPosted={() => setReplyCount((c) => c + 1)} />
          )}
        </div>
      </div>
    </div>
  );
}
