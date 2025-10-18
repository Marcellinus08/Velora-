// src/components/task/comments.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ===== helpers ===== */
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

/* ===== session cache utk avatar Abstract (TTL 30m) ===== */
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

type DbComment = {
  id: string;
  created_at: string;
  user_addr: string | null;
  content: string | null;
};

type ListItem = {
  id: string;
  addr: string;     // lowercase
  name: string;     // short display
  time: string;     // "just now" etc
  text: string;     // content
};

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

function CommentItem({
  name,
  time,
  avatarUrl,
  text,
  seed = 8,
}: {
  name: string;
  time: string;
  avatarUrl: string;
  text: string;
  seed?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [count, setCount] = useState(5 + (seed % 37));

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      if (disliked) setDisliked(false);
    }
  };

  const toggleDislike = () => {
    setDisliked((d) => !d);
    if (!disliked && liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <div className="group grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition-colors hover:bg-neutral-900">
      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
        {/* pakai <img> supaya bebas domain */}
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
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
          <p className="font-semibold text-neutral-50">{name}</p>
          <span className="text-sm text-neutral-400">• {time}</span>
        </div>

        <p
          className="mt-1 text-neutral-50"
          style={
            expanded
              ? undefined
              : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }
          }
        >
          {text}
        </p>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <button
            onClick={toggleLike}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
              liked ? "bg-[var(--primary-500)]/20 text-[var(--primary-300)]" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{count}</span>
          </button>

          <button
            onClick={toggleDislike}
            aria-label="Dislike"
            title="Dislike"
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
              disliked ? "bg-neutral-700 text-neutral-200" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-2.667a4 4 0 00.8-2.4z" />
            </svg>
          </button>

          <button className="ml-1 rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800">Reply</button>

          {!expanded && (
            <button onClick={() => setExpanded(true)} className="ml-2 rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800">
              Read more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({
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
      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
        <img
          src={myAvatarUrl}
          alt="Your avatar"
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://api.dicebear.com/7.x/identicon/svg?seed=guest";
          }}
        />
      </div>

      <div className="w-full rounded-2xl border border-neutral-700 bg-neutral-800/60 focus-within:border-[var(--primary-500)]">
        <textarea
          rows={1}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Write a comment…"
          className="block w-full resize-none rounded-2xl bg-transparent px-4 pt-3 text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-2 text-neutral-400">
            <button className="rounded p-1 hover:bg-neutral-700/60" title="Emoji" type="button">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-7a1 1 0 10-2 0 1 1 0 002 0zM9 11a1 1 0 11-2 0 1 1 0 012 0zm1 4a5 5 0 004.546-2.916.75.75 0 10-1.343-.668A3.5 3.5 0 0110 13.5a3.5 3.5 0 01-3.203-2.084.75.75 0 10-1.343.668A5 5 0 0010 15z" />
              </svg>
            </button>
          </div>

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
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // peta alamat -> avatarURL
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  // Load comments dari DB + siapkan avatar
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) ambil komentar
        const { data } = await supabase
          .from("video_comments")
          .select("id, created_at, user_addr, content")
          .eq("video_id", videoId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

        if (!alive) return;

        const mapped: ListItem[] = (data || []).map((r: DbComment) => {
          const addr = (r.user_addr || "0x").toLowerCase();
          return {
            id: r.id,
            addr,
            name: shortAddr(addr) || "Anonymous",
            time: relTime(r.created_at),
            text: r.content || "",
          };
        });

        setItems(mapped);

        // 2) siapkan daftar alamat yang perlu avatar
        const addrs = Array.from(
          new Set(
            [
              ...mapped.map((m) => m.addr),
              (currentUserAddr || "").toLowerCase(),
            ].filter(Boolean)
          )
        );

        if (addrs.length === 0) {
          setAvatarMap({});
          return;
        }

        // 3) ambil avatar_url dari tabel profiles terlebih dahulu
        const { data: profs } = await supabase
          .from("profiles")
          .select("abstract_id, avatar_url")
          .in("abstract_id", addrs);

        const initialMap: Record<string, string> = {};
        (profs || []).forEach((p: any) => {
          const addr = (p?.abstract_id || "").toLowerCase();
          const url = p?.avatar_url || "";
          if (addr && url) initialMap[addr] = url;
        });

        // 4) untuk alamat yg belum punya avatar_url di DB, coba fetch Abstract (dengan cache)
        const needAbstract = addrs.filter((a) => !initialMap[a]);

        if (needAbstract.length) {
          const results = await Promise.all(
            needAbstract.map(async (addr) => {
              const cached = readCacheUrl(okKey(addr));
              if (cached) return [addr, cached] as const;

              if (readCacheMiss(missKey(addr))) return [addr, ""] as const;

              try {
                const r = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
                if (r.ok) {
                  const j = await r.json();
                  const url: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
                  if (url) {
                    writeCacheUrl(okKey(addr), url);
                    return [addr, url] as const;
                  }
                }
              } catch {
                /* ignore */
              }
              writeCacheMiss(missKey(addr));
              return [addr, ""] as const;
            })
          );

          results.forEach(([addr, url]) => {
            if (url) initialMap[addr] = url;
          });
        }

        // 5) set peta avatar (fallback ke identicon jika kosong saat render)
        if (alive) setAvatarMap(initialMap);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [videoId, currentUserAddr]);

  // insert komentar
  const onSend = async (text: string) => {
    const addr = (currentUserAddr || "anonymous").toLowerCase();
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, user_addr: addr, content: text })
      .select("id, created_at, user_addr, content")
      .single();

    if (!error && data) {
      const addrLower = (data.user_addr || "0x").toLowerCase();
      setItems((prev) => [
        {
          id: data.id,
          addr: addrLower,
          name: shortAddr(addrLower) || "Anonymous",
          time: relTime(data.created_at),
          text: data.content || "",
        },
        ...prev,
      ]);

      // kalau avatar belum ada di map, coba isi cepat dari cache/abstract
      if (!avatarMap[addrLower]) {
        const cached = readCacheUrl(okKey(addrLower));
        if (cached) {
          setAvatarMap((m) => ({ ...m, [addrLower]: cached }));
        } else {
          try {
            const r = await fetch(`/api/abstract/user/${addrLower}`, { cache: "force-cache" });
            if (r.ok) {
              const j = await r.json();
              const url: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
              if (url) {
                writeCacheUrl(okKey(addrLower), url);
                setAvatarMap((m) => ({ ...m, [addrLower]: url }));
              }
            }
          } catch {
            /* ignore */
          }
        }
      }
    }
  };

  // avatar getter (DB > Abstract > identicon)
  const getAvatarUrl = (addr: string) =>
    avatarMap[addr] ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(addr || "anon")}`;

  const sorted = useMemo(() => {
    if (sort === "newest") return items;
    // "top" belum pakai metrik; tetap return items apa adanya.
    return items;
  }, [items, sort]);

  const myAvatar = getAvatarUrl((currentUserAddr || "guest").toLowerCase());

  return (
    <div className="w-full border-t border-neutral-800 bg-neutral-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">
          Comments <span className="ml-2 text-base font-normal text-neutral-400">• {items.length}</span>
        </h2>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <CommentComposer onSend={onSend} disabled={loading} myAvatarUrl={myAvatar} />

      <div className="mt-5 space-y-4">
        {sorted.map((c, idx) => (
          <CommentItem
            key={c.id}
            name={c.name}
            time={c.time}
            avatarUrl={getAvatarUrl(c.addr)}
            text={c.text}
            seed={idx}
          />
        ))}
      </div>
    </div>
  );
}
