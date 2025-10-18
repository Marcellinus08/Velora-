// src/components/task/likebutton.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ========= utils ========= */
const HEX40 = /^0x[a-fA-F0-9]{40}$/;
const isHexAddr = (s?: unknown): s is `0x${string}` =>
  typeof s === "string" && HEX40.test(s);

function findHexDeep(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") {
    const m = v.match(HEX40);
    return m?.[0] ?? null;
  }
  if (Array.isArray(v)) {
    for (const it of v) {
      const hit = findHexDeep(it);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof v === "object") {
    for (const k of Object.keys(v)) {
      const hit = findHexDeep(v[k]);
      if (hit) return hit;
    }
  }
  return null;
}

/** Cari address dari session/local storage (mendukung JSON nested) */
function readAddressFromStorage(): `0x${string}` | null {
  if (typeof window === "undefined") return null;

  const preferred = [
    "abstract:address",
    "abs:address",
    "abstract_id",
    "glonic:abstract_id",
    "wallet",
    "address",
    "account",
    "user",
    "profile",
    "session",
    "wagmi.store",
    "persist:root",
  ];

  const stores = [sessionStorage, localStorage];

  // 1) coba kunci favorit terlebih dahulu
  for (const store of stores) {
    for (const key of preferred) {
      const raw = store.getItem(key);
      if (!raw) continue;

      if (isHexAddr(raw)) return raw as `0x${string}`;
      try {
        const obj = JSON.parse(raw);
        const deep = findHexDeep(obj);
        if (isHexAddr(deep)) return deep as `0x${string}`;
      } catch {
        const deep = findHexDeep(raw);
        if (isHexAddr(deep)) return deep as `0x${string}`;
      }
    }
  }

  // 2) brute-force semua item
  for (const store of stores) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)!;
      const raw = store.getItem(key) || "";
      if (isHexAddr(raw)) return raw as `0x${string}`;
      try {
        const obj = JSON.parse(raw);
        const deep = findHexDeep(obj);
        if (isHexAddr(deep)) return deep as `0x${string}`;
      } catch {
        const deep = findHexDeep(raw);
        if (isHexAddr(deep)) return deep as `0x${string}`;
      }
    }
  }

  return null;
}

/** Fallback terakhir: baca dari Supabase (user login) -> profiles.abstract_id */
async function readAddressFromSupabase(): Promise<`0x${string}` | null> {
  try {
    const { data: auth } = await supabase.auth.getSession();
    const uid = auth?.session?.user?.id;
    if (!uid) return null;

    const { data } = await supabase
      .from("profiles")
      .select("abstract_id")
      .eq("id", uid)
      .maybeSingle();

    const addr = data?.abstract_id;
    return isHexAddr(addr) ? (addr as `0x${string}`) : null;
  } catch {
    return null;
  }
}

/* ========= component ========= */
export default function LikeButton({
  videoId,
  initialCount = 0,
  className = "",
}: {
  videoId: string;
  initialCount?: number;
  className?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState<`0x${string}` | null>(null);

  // deteksi address sekali
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = readAddressFromStorage();
      if (alive && s) {
        setAddr(s.toLowerCase() as `0x${string}`);
        return;
      }
      const b = await readAddressFromSupabase();
      if (alive && b) setAddr(b.toLowerCase() as `0x${string}`);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // cek status like user ini
  useEffect(() => {
    let active = true;
    (async () => {
      if (!addr) return;
      const { data } = await supabase
        .from("video_likes")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_addr", addr)
        .maybeSingle();
      if (!active) return;
      setLiked(!!data);
    })();
    return () => {
      active = false;
    };
  }, [addr, videoId]);

  async function refreshCount() {
    const { count: c } = await supabase
      .from("video_likes")
      .select("*", { head: true, count: "exact" })
      .eq("video_id", videoId);
    setCount(c ?? 0);

    // Optional: sinkronkan aggregate di tabel videos (jika tidak pakai trigger)
    await supabase.from("videos").update({ likes_count: c ?? 0 }).eq("id", videoId);
  }

  const toggleLike = async () => {
    if (!addr) {
      alert("Please connect your wallet to like this video.");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (!liked) {
        await supabase
          .from("video_likes")
          .upsert([{ video_id: videoId, user_addr: addr }], {
            onConflict: "video_id,user_addr",
          });
        setLiked(true);
      } else {
        await supabase.from("video_likes").delete().eq("video_id", videoId).eq("user_addr", addr);
        setLiked(false);
      }
      await refreshCount();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
        liked
          ? "border-[var(--primary-500)] bg-violet-900/20 text-[var(--primary-300)]"
          : "border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700",
        className,
      ].join(" ")}
      aria-pressed={liked}
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
