"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { CommunityReply } from "./types";

/* ====== utils & cache ====== */
const TTL = 5 * 60_000;
const readCache = <T,>(k: string): T | null => {
  try {
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > TTL) return null;
    return v as T;
  } catch { return null; }
};
const writeCache = <T,>(k: string, v: T) => {
  try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v })); } catch {}
};
const isAddr = (a?: string) => !!a && /^0x[a-f0-9]{40}$/.test(a.toLowerCase());
const isPlaceholder = (u?: string | null) =>
  !u || u.toLowerCase().includes("dicebear.com") || u.toLowerCase().includes("placeholder");
const short = (a?: string) =>
  a && a.startsWith("0x") && a.length >= 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "-";

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  const text = await res.text().catch(() => "");
  throw new Error(`Unexpected response (${res.status}).${text ? ` Body: ${text.slice(0, 150)}` : ""}`);
}

/* ====== hook avatar (DB → Abstract → identicon) ====== */
function useAddressAvatar(address?: string, initial?: string | null) {
  const addr = useMemo(() => (address ? address.toLowerCase() : ""), [address]);
  const [src, setSrc] = useState<string | null>(initial && !isPlaceholder(initial) ? initial : null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAddr(addr)) return;
      if (src && !isPlaceholder(src)) return;

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
        setSrc(`${prof.avatar_url}`);
        return;
      }

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

      if (alive) setSrc(`https://api.dicebear.com/7.x/identicon/svg?seed=${addr || "anon"}`);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr, initial]);

  return src;
}

/* ====== item reply (agar hook tidak dipakai di dalam map langsung) ====== */
function ReplyItem({ r }: { r: CommunityReply }) {
  const avatar = useAddressAvatar(r.authorAddress, r.authorAvatar || null);
  const addrLower = (r.authorAddress || "").toLowerCase();
  const identicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${addrLower || "anon"}`;

  return (
    <li className="flex items-start gap-3">
      <img
        src={avatar ?? identicon}
        alt="avatar"
        className="size-8 rounded-full object-cover mt-1"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== identicon) el.src = identicon;
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-100">
            {r.authorName?.trim() || short(r.authorAddress)}
          </span>
          <span className="text-xs text-neutral-400">
            {new Date(r.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-neutral-200 whitespace-pre-wrap">{r.content}</p>
      </div>
    </li>
  );
}

/* ====== list replies ====== */
export default function Replies({
  postId,
  onPosted,
}: {
  postId: string;
  onPosted?: () => void;
}) {
  const { address } = useAccount();
  const me = (address ?? "").toLowerCase();

  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/community/posts/${postId}/replies?limit=50`, { cache: "no-store" });
      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setReplies(j.replies as CommunityReply[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load replies");
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [postId]);

  async function submit() {
    if (!me) { alert("Connect wallet dulu."); return; }
    const content = text.trim();
    if (!content) return;
    setText("");
    try {
      const r = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me, content }),
      });
      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      await load();
      onPosted?.();
    } catch (e: any) {
      alert(e?.message || "Gagal kirim reply");
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900">
      {/* composer */}
      <div className="flex gap-2 p-3">
        <textarea
          className="w-full resize-y rounded-md border border-neutral-700 bg-neutral-800 p-2 text-sm text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
          rows={2}
          placeholder="Write a reply…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={submit}
          className="self-end rounded-md bg-[var(--primary-500)] px-3 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
        >
          Reply
        </button>
      </div>

      <div className="h-px w-full bg-neutral-800" />

      {/* list */}
      <div className="p-3">
        {loading ? (
          <p className="text-sm text-neutral-400">Loading replies…</p>
        ) : err ? (
          <p className="text-sm text-red-300">{err}</p>
        ) : replies.length === 0 ? (
          <p className="text-sm text-neutral-400">No replies yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {replies.map((r) => (
              <ReplyItem key={r.id} r={r} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
