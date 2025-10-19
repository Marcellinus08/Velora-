"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============ Helpers ============ */
const shortAddr = (a?: string | null) =>
  !a ? "" : a.length <= 12 ? a : `${a.slice(0, 6)}...${a.slice(-4)}`;

const relTime = (d: string | Date) => {
  const t = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - t.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ============ Session cache utk avatar Abstract (TTL 30m) ============ */
const TTL_MS = 30 * 60 * 1000;
const okKey = (addr: string) => `absavatar:${addr}`;
const missKey = (addr: string) => `absavatar-miss:${addr}`;

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

/* ============ DB row types & UI types ============ */
type DbComment = {
  id: string;
  created_at: string;
  user_addr: string | null;
  content: string | null;
  parent_id: string | null;
};

type UiComment = {
  id: string;
  addr: string;
  name: string;
  time: string;
  text: string;
  likeCount: number;
  likedByMe: boolean;
  replies: UiComment[];
};

/* ============ Sorting dropdown ============ */
function SortDropdown({
  value,
  onChange,
}: {
  value: "top" | "newest";
  onChange: (v: "top" | "newest") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm3 4h8a1 1 0 010 2H6a1 1 0 110-2zm3 4h2a1 1 0 010 2H9a1 1 0 110-2z" />
        </svg>
        <span>{value === "top" ? "Top" : "Newest"}</span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur">
          {(["top", "newest"] as const).map((opt) => (
            <button
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm ${
                value === opt ? "bg-neutral-800 text-neutral-50" : "text-neutral-300 hover:bg-neutral-800/70"
              }`}
            >
              {opt === "top" ? "Top" : "Newest"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Like pill (warna kontras + animasi) ============ */
function LikePill({
  count,
  liked,
  disabled,
  onClick,
}: {
  count: number;
  liked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const [burst, setBurst] = useState(false);

  const handle = () => {
    if (disabled) return;
    onClick();
    setBurst(true);
    setTimeout(() => setBurst(false), 350);
  };

  return (
    <button
      onClick={handle}
      className={`relative inline-flex items-center gap-1 rounded-full px-2 py-1 transition
      ${liked
        ? "bg-violet-600/20 text-violet-200 ring-1 ring-violet-500/50"
        : "bg-neutral-800/60 text-neutral-300 ring-1 ring-neutral-700/60 hover:bg-neutral-800"}
      ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.03] active:scale-95"}
      `}
      title={liked ? "Unlike" : "Like"}
    >
      {/* burst ring */}
      {burst && liked && (
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full animate-ping bg-violet-500/20" />
      )}
      <svg
        className={`h-4 w-4 transition ${liked ? "text-violet-300" : "text-neutral-300"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
      <span className={`text-[13px] ${liked ? "font-semibold" : ""}`}>{count}</span>
    </button>
  );
}

/* ============ Reply composer ============ */
function ReplyComposer({
  onSend,
  myAvatarUrl,
}: {
  onSend: (text: string) => Promise<void>;
  myAvatarUrl: string;
}) {
  const [val, setVal] = useState("");
  const submit = async () => {
    const v = val.trim();
    if (!v) return;
    await onSend(v);
    setVal("");
  };
  return (
    <div className="mt-2 ml-10 flex items-start gap-3">
      <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
        <img src={myAvatarUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/60">
        <textarea
          rows={1}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Write a reply…"
          className="block w-full resize-none rounded-xl bg-transparent px-3 pt-2 text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
        />
        <div className="flex items-center justify-end px-3 pb-2">
          <button
            onClick={submit}
            disabled={!val.trim()}
            className="rounded-full bg-[var(--primary-500)] px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Comment item ============ */
function CommentItem({
  c,
  avatarUrl,
  myAddr,
  myAvatarUrl,
  getAvatarUrl,
  onToggleLike,
  onReply,
}: {
  c: UiComment;
  avatarUrl: string;
  myAddr?: string | null;
  myAvatarUrl: string;
  getAvatarUrl: (addr: string) => string;
  onToggleLike: (commentId: string, liked: boolean) => Promise<void>;
  onReply: (parentId: string, text: string) => Promise<void>;
}) {
  const [openReply, setOpenReply] = useState(false);

  return (
    <div className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition-colors hover:bg-neutral-900">
      <div className="grid grid-cols-[40px_1fr] gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://api.dicebear.com/7.x/identicon/svg?seed=fallback";
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-neutral-50">{c.name}</p>
            <span className="text-sm text-neutral-400">• {c.time}</span>
          </div>

          <p className="mt-1 text-neutral-50">{c.text}</p>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <LikePill
              count={c.likeCount}
              liked={c.likedByMe}
              disabled={!myAddr}
              onClick={() => {
                if (!myAddr) return alert("Please connect your wallet to like.");
                onToggleLike(c.id, c.likedByMe);
              }}
            />

            <button
              onClick={() => setOpenReply((v) => !v)}
              className="rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Replies (1 level) */}
      {c.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {c.replies.map((r) => (
            <div key={r.id} className="grid grid-cols-[40px_1fr] gap-3 ml-10">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
                <img src={getAvatarUrl(r.addr)} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-neutral-50">{r.name}</p>
                  <span className="text-sm text-neutral-400">• {r.time}</span>
                </div>
                <p className="mt-1 text-neutral-50">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {openReply && (
        <ReplyComposer
          myAvatarUrl={myAvatarUrl}
          onSend={async (text) => {
            if (!myAddr) return alert("Please connect your wallet to reply.");
            await onReply(c.id, text);
            setOpenReply(false);
          }}
        />
      )}
    </div>
  );
}

/* ============ Top composer ============ */
function TopComposer({
  onSend,
  disabled,
  myAvatarUrl,
}: {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  myAvatarUrl: string;
}) {
  const [val, setVal] = useState("");

  const submit = async () => {
    const v = val.trim();
    if (!v) return;
    await onSend(v);
    setVal("");
  };

  return (
    <div className="flex items-start gap-3">

      <div className="w-full rounded-2xl border border-neutral-700 bg-neutral-800/60 focus-within:border-[var(--primary-500)]">
        <textarea
          rows={1}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Write a comment…"
          className="block w-full resize-none rounded-2xl bg-transparent px-4 pt-3 text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
        />
        <div className="flex items-center justify-end px-3 pb-2 pt-1">
          <button
            onClick={submit}
            disabled={disabled || !val.trim()}
            className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================== MAIN ======================== */
export default function Comments({
  videoId,
  currentUserAddr,
}: {
  videoId: string;
  currentUserAddr?: string | null;
}) {
  const [sort, setSort] = useState<"top" | "newest">("newest");
  const [list, setList] = useState<UiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const myAddr = (currentUserAddr || "").toLowerCase();

  // peta alamat -> avatarURL (DB/Abstract), sisanya fallback identicon saat render
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) ambil semua komentar video
        const { data: rows } = await supabase
          .from("video_comments")
          .select("id, created_at, user_addr, content, parent_id")
          .eq("video_id", videoId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

        const comments = (rows || []) as DbComment[];
        const ids = comments.map((c) => c.id);

        // 2) ambil likes untuk semua komentar
        const { data: likesRows } = ids.length
          ? await supabase
              .from("video_comment_likes")
              .select("comment_id, user_addr")
              .in("comment_id", ids)
          : { data: [] as any[] };

        const likeCountMap = new Map<string, number>();
        const likedByMeSet = new Set<string>();
        (likesRows || []).forEach((r: any) => {
          likeCountMap.set(r.comment_id, (likeCountMap.get(r.comment_id) || 0) + 1);
          if (myAddr && r.user_addr?.toLowerCase() === myAddr) likedByMeSet.add(r.comment_id);
        });

        // 3) bentuk tree (1 level)
        const byId = new Map<string, UiComment>();
        const roots: UiComment[] = [];

        comments.forEach((r) => {
          const addr = (r.user_addr || "0x").toLowerCase();
          const node: UiComment = {
            id: r.id,
            addr,
            name: shortAddr(addr) || "Anonymous",
            time: relTime(r.created_at),
            text: r.content || "",
            likeCount: likeCountMap.get(r.id) || 0,
            likedByMe: likedByMeSet.has(r.id),
            replies: [],
          };
          byId.set(r.id, node);
        });

        comments.forEach((r) => {
          const node = byId.get(r.id)!;
          if (r.parent_id) {
            const p = byId.get(r.parent_id);
            if (p) p.replies.push(node);
          } else {
            roots.push(node);
          }
        });

        if (alive) setList(roots);

        // 4) siapkan peta avatar: DB terlebih dulu, lalu Abstract (cached)
        const addrs = Array.from(
          new Set(
            [
              ...comments.map((c) => (c.user_addr || "").toLowerCase()),
              myAddr,
            ].filter(Boolean)
          )
        );

        if (addrs.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("abstract_id, avatar_url")
            .in("abstract_id", addrs);

          const map: Record<string, string> = {};
          (profs || []).forEach((p: any) => {
            const addr = (p?.abstract_id || "").toLowerCase();
            if (addr && p?.avatar_url) map[addr] = p.avatar_url;
          });

          const need = addrs.filter((a) => !map[a]);
          if (need.length) {
            const results = await Promise.all(
              need.map(async (a) => {
                const cached = readCacheUrl(okKey(a));
                if (cached) return [a, cached] as const;
                if (readCacheMiss(missKey(a))) return [a, ""] as const;
                try {
                  const r = await fetch(`/api/abstract/user/${a}`, { cache: "force-cache" });
                  if (r.ok) {
                    const j = await r.json();
                    const url: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
                    if (url) {
                      writeCacheUrl(okKey(a), url);
                      return [a, url] as const;
                    }
                  }
                } catch {}
                writeCacheMiss(missKey(a));
                return [a, ""] as const;
              })
            );
            results.forEach(([a, url]) => {
              if (url) map[a] = url;
            });
          }

          if (alive) setAvatarMap(map);
        } else {
          if (alive) setAvatarMap({});
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [videoId, myAddr]);

  // avatar getter: DB/Abstract map -> fallback identicon
  const getAvatarUrl = (addr: string) =>
    avatarMap[addr] ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(addr || "anon")}`;

  const myAvatarUrl = getAvatarUrl(myAddr || "guest");

  // insert komentar root
  const onSend = async (text: string) => {
    const addr = myAddr;
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, user_addr: addr || "anonymous", content: text })
      .select("id, created_at, user_addr, content, parent_id")
      .single();

    if (!error && data) {
      const addrLower = (data.user_addr || "0x").toLowerCase();
      const newItem: UiComment = {
        id: data.id,
        addr: addrLower,
        name: shortAddr(addrLower) || "Anonymous",
        time: relTime(data.created_at),
        text: data.content || "",
        likeCount: 0,
        likedByMe: false,
        replies: [],
      };
      setList((prev) => [newItem, ...prev]);
      if (!avatarMap[addrLower]) {
        setAvatarMap((m) => ({ ...m, [addrLower]: myAvatarUrl }));
      }
    }
  };

  // insert reply
  const onReply = async (parentId: string, text: string) => {
    const addr = myAddr;
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, user_addr: addr || "anonymous", content: text, parent_id: parentId })
      .select("id, created_at, user_addr, content, parent_id")
      .single();

    if (!error && data) {
      const addrLower = (data.user_addr || "0x").toLowerCase();
      setList((prev) =>
        prev.map((p) =>
          p.id === parentId
            ? {
                ...p,
                replies: [
                  {
                    id: data.id,
                    addr: addrLower,
                    name: shortAddr(addrLower) || "Anonymous",
                    time: relTime(data.created_at),
                    text: data.content || "",
                    likeCount: 0,
                    likedByMe: false,
                    replies: [],
                  },
                  ...p.replies,
                ],
              }
            : p
        )
      );
      if (!avatarMap[addrLower]) {
        setAvatarMap((m) => ({ ...m, [addrLower]: myAvatarUrl }));
      }
    }
  };

  // toggle like (simpan ke DB video_comment_likes)
  const onToggleLike = async (commentId: string, liked: boolean) => {
    if (!myAddr) return;
    if (!liked) {
      const { error } = await supabase.from("video_comment_likes").insert({
        comment_id: commentId,
        user_addr: myAddr,
      });
      if (!error) {
        setList((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likeCount: c.likeCount + 1, likedByMe: true } : c
          )
        );
      }
    } else {
      const { error } = await supabase
        .from("video_comment_likes")
        .delete()
        .match({ comment_id: commentId, user_addr: myAddr });
      if (!error) {
        setList((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likeCount: Math.max(0, c.likeCount - 1), likedByMe: false } : c
          )
        );
      }
    }
  };

  const sorted = useMemo(() => {
    if (sort === "newest") return list;
    return [...list].sort((a, b) => b.likeCount - a.likeCount);
  }, [list, sort]);

  return (
    <div className="w-full border-t border-neutral-800 bg-neutral-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">
          Comments <span className="ml-2 text-base font-normal text-neutral-400">• {list.length}</span>
        </h2>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <TopComposer onSend={onSend} disabled={loading} myAvatarUrl={myAvatarUrl} />

      <div className="mt-5 space-y-4">
        {sorted.map((c) => (
          <CommentItem
            key={c.id}
            c={c}
            avatarUrl={getAvatarUrl(c.addr)}
            myAddr={myAddr}
            myAvatarUrl={myAvatarUrl}
            getAvatarUrl={getAvatarUrl}
            onToggleLike={onToggleLike}
            onReply={onReply}
          />
        ))}
      </div>
    </div>
  );
}
