// src/components/community/replies.tsx
"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";

type ReplyNode = {
  id: string;
  postId: string;
  authorAddress: string;
  authorName: string | null;
  authorAvatar: string | null;
  content: string;
  createdAt: string;
  parentId: string | null;
  likes: number;
  replies: number;
  liked: boolean;
  children: ReplyNode[];
};

const isAddr = (a?: string) => !!a && /^0x[a-f0-9]{40}$/.test(a.toLowerCase());
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function Replies({
  postId,
  onPosted,
}: {
  postId: string;
  onPosted?: () => void;
}) {
  const { address } = useAccount();
  const me = useMemo(() => (address ? address.toLowerCase() : ""), [address]);

  const [tree, setTree] = useState<ReplyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftTop, setDraftTop] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/community/${postId}/replies?me=${me}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to load replies");
      setTree(j.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, me]);

  async function submit(content: string, parentId: string | null) {
    if (!isAddr(me)) return alert("Connect wallet dulu.");
    const text = content.trim();
    if (!text) return;

    const body = { abstractId: me, content: text, parentId };
    const r = await fetch(`/api/community/${postId}/replies`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      alert(j?.error || "Failed to post reply");
      return;
    }
    setDraftTop("");
    await load();
    onPosted?.();
  }

  return (
    <div className="mt-4 border-t border-neutral-800 pt-4">
      {/* form reply top-level */}
      <div className="flex items-start gap-3 mb-4">
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${me || "anon"}`}
          className="h-8 w-8 rounded-full object-cover"
          alt=""
        />
        <div className="flex-1 flex gap-2">
          <textarea
            value={draftTop}
            onChange={(e) => setDraftTop(e.target.value)}
            className="h-10 w-full min-h-10 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-[var(--primary-500)]"
            placeholder="Write a reply…"
          />
          <button
            onClick={() => submit(draftTop, null)}
            className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
          >
            Reply
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-neutral-400">Loading replies…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-5">
        {tree.map((n) => (
          <ReplyItem key={n.id} node={n} me={me} onReply={(txt) => submit(txt, n.id)} onReload={load} />
        ))}
      </div>
    </div>
  );
}

function ReplyItem({
  node,
  me,
  onReply,
  onReload,
  depth = 0,
}: {
  node: ReplyNode;
  me: string;
  onReply: (text: string) => void;
  onReload: () => Promise<void>;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState(node.liked);
  const [likes, setLikes] = useState(node.likes);

  async function toggleLike() {
    if (!isAddr(me)) return alert("Connect wallet dulu.");
    const willLike = !liked;
    // optimistik
    setLiked(willLike);
    setLikes((c) => c + (willLike ? 1 : -1));
    try {
      await fetch("/api/community/replies/like", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ replyId: node.id, abstractId: me, like: willLike }),
      });
    } catch {
      // rollback kalau gagal
      setLiked(!willLike);
      setLikes((c) => c - (willLike ? 1 : -1));
    }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <img
          src={node.authorAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${node.authorAddress}`}
          className="h-8 w-8 rounded-full object-cover"
          alt=""
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${node.authorAddress}`;
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-100">
              {node.authorName?.trim() || short(node.authorAddress)}
            </span>
            <span className="text-neutral-500">
              {new Date(node.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 whitespace-pre-wrap text-neutral-200">{node.content}</div>

          <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
            <button
              onClick={toggleLike}
              className={
                "flex items-center gap-1 hover:text-neutral-100 " +
                (liked ? "text-[var(--primary-500)] hover:text-[var(--primary-500)]/80" : "")
              }
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M14 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M10 4.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
              </svg>
              <span>{likes} Likes</span>
            </button>

            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              {node.replies} Replies
            </span>

            <button className="hover:text-neutral-100" onClick={() => setOpen((v) => !v)}>
              Reply
            </button>
          </div>

          {open && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-9 w-full min-h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 focus:border-[var(--primary-500)]"
                placeholder="Write a reply…"
              />
              <button
                onClick={async () => {
                  await onReply(draft);
                  setDraft("");
                  setOpen(false);
                }}
                className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-opacity-90"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* children */}
      {node.children?.length > 0 && (
        <div className="mt-3 ml-10 flex flex-col gap-4">
          {node.children.map((c) => (
            <ReplyItem
              key={c.id}
              node={c}
              me={me}
              onReply={(txt) => onReplyChild(txt, c.id, onReply)}
              onReload={onReload}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// helper supaya reply ke anak tetap lewat handler parent (submit dengan parentId)
async function onReplyChild(text: string, _parentId: string, parentSubmit: (t: string) => void) {
  await parentSubmit(text);
}
