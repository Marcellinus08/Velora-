"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { AbstractProfile } from "@/components/abstract-profile";

type ReplyNode = {
  id: string;
  postId: string;
  parentId: string | null;
  authorAddress: string;
  authorName: string | null;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  liked?: boolean;
  children: ReplyNode[];
};

const short = (a?: string) =>
  a && a.startsWith("0x") && a.length >= 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "-";

function LikeSvg() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M14 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M10 4.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
    </svg>
  );
}
function RepliesSvg() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Avatar({ address, url }: { address: string; url: string | null }) {
  if (url && url.trim() !== "") {
    const fallback = `https://api.dicebear.com/7.x/identicon/svg?seed=${address || "anon"}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="avatar"
        className="h-8 w-8 rounded-full object-cover"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== fallback) el.src = fallback;
        }}
      />
    );
  }
  return (
    <AbstractProfile
      size="xs"
      showTooltip={false}
      address={address as `0x${string}`}
      className="!h-8 !w-8 !rounded-full"
    />
  );
}

export default function Replies({ postId, onPosted }: { postId: string; onPosted?: () => void }) {
  const { address } = useAccount();
  const me = useMemo(() => (address ? address.toLowerCase() : ""), [address]);

  const [items, setItems] = useState<ReplyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const url = me ? `/api/community/posts/${postId}/replies?me=${me}` : `/api/community/posts/${postId}/replies`;
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text());
      const j = (await r.json()) as { items: ReplyNode[] };
      setItems(j.items || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load replies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, me]);

  async function postReply(parentId?: string | null) {
    if (!me || !text.trim()) return;
    try {
      const r = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me, content: text.trim(), parentId: parentId ?? null }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      setText("");
      onPosted?.();
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to post reply");
    }
  }

  // ====== LIKE Reply (toggle) ======
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);

  async function toggleLike(id: string) {
    if (!me || pendingLikeId) return;
    setPendingLikeId(id);
    try {
      const r = await fetch("/api/community/replies/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId: id, abstractId: me }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");
      const liked = !!j?.liked;
      const likes = Number(j?.likes ?? 0);
      setItems((prev) => prev.map((n) => updateNode(n, id, (node) => ({ ...node, liked, likes }))));
    } catch (e) {
      // biarkan silent; DB tetap aman oleh PK
    } finally {
      setPendingLikeId(null);
    }
  }

  function updateNode(node: ReplyNode, id: string, fn: (n: ReplyNode) => ReplyNode): ReplyNode {
    if (node.id === id) return fn(node);
    return { ...node, children: node.children.map((c) => updateNode(c, id, fn)) };
  }

  function Item({ node }: { node: ReplyNode }) {
    const [openReplyBox, setOpenReplyBox] = useState(false);
    const [childText, setChildText] = useState("");
    const [showChildren, setShowChildren] = useState(false);

    async function postChild() {
      if (!me || !childText.trim()) return;
      try {
        const r = await fetch(`/api/community/posts/${postId}/replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractId: me, content: childText.trim(), parentId: node.id }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Failed");
        setChildText("");
        setOpenReplyBox(false);
        onPosted?.();
        await load();
        setShowChildren(true);
      } catch {}
    }

    return (
      <div className="mt-6">
        <div className="flex items-start gap-3">
          <Avatar address={node.authorAddress} url={node.authorAvatar} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-100">
                {node.authorName?.trim() || short(node.authorAddress)}
              </span>
              <span className="text-xs text-neutral-400">
                {new Date(node.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="mt-1 whitespace-pre-wrap text-neutral-200">{node.content}</div>

            {/* actions: LIKE + REPLIES + REPLY */}
            <div className="mt-2 flex items-center gap-6 text-sm text-neutral-400">
              <button
                onClick={() => toggleLike(node.id)}
                disabled={pendingLikeId === node.id}
                className={
                  "flex items-center gap-1.5 hover:text-neutral-50 disabled:opacity-60 " +
                  (node.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
                }
                aria-pressed={!!node.liked}
              >
                <LikeSvg />
                <span>{node.likes} Likes</span>
              </button>

              {node.replies > 0 && (
                <button
                  onClick={() => setShowChildren((v) => !v)}
                  className="flex items-center gap-1.5 hover:text-neutral-50"
                >
                  <RepliesSvg />
                  <span>{showChildren ? "Hide" : `${node.replies} Replies`}</span>
                </button>
              )}

              <button
                className="flex items-center gap-1.5 text-[var(--primary-500)] hover:underline"
                onClick={() => setOpenReplyBox((v) => !v)}
              >
                Reply
              </button>
            </div>

            {/* composer anak */}
            {openReplyBox && (
              <div className="mt-2 flex items-start gap-2">
                <Avatar address={me} url={null} />
                <div className="flex-1">
                  <textarea
                    value={childText}
                    onChange={(e) => setChildText(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-50 outline-none"
                    placeholder="Write a reply…"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      className="rounded-md px-3 py-1 text-neutral-300 hover:bg-neutral-800"
                      onClick={() => setOpenReplyBox(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-md bg-[var(--primary-600)] px-3 py-1 text-neutral-50 hover:bg-[var(--primary-500)]"
                      onClick={postChild}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* children (collapse/expand) */}
            {showChildren && node.children?.length > 0 && (
              <div className="mt-3 border-l border-neutral-800 pl-4">
                {node.children.map((c) => (
                  <Item key={c.id} node={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* composer top-level */}
      <div className="flex items-start gap-3">
        <Avatar address={me} url={null} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-50 outline-none"
            placeholder="Write a reply…"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => postReply(null)}
              disabled={!text.trim()}
              className="rounded-md bg-[var(--primary-600)] px-4 py-1.5 text-sm text-neutral-50 hover:bg-[var(--primary-500)] disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
      {loading && <p className="mt-3 text-sm text-neutral-400">Loading replies…</p>}

      <div className="mt-3">
        {items.map((n) => (
          <Item key={n.id} node={n} />
        ))}
      </div>
    </div>
  );
}
