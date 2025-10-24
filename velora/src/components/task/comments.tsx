// src/components/task/comments.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import { AbstractProfile } from "@/components/abstract-profile";

/* =======================================================
   Utils
======================================================= */
const shortAddr = (a?: string | null) =>
  !a ? "" : a.length <= 12 ? a : `${a.slice(0, 6)}...${a.slice(-4)}`;

const relTime = (d: string | Date) => {
  const t = typeof d === "string" ? new Date(d) : d;
  const s = Math.max(1, Math.floor((Date.now() - t.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d2 = Math.floor(h / 24);
  return `${d2}d ago`;
};

const isAddr = (x?: string | null): x is `0x${string}` =>
  !!x && /^0x[a-fA-F0-9]{40}$/.test(x);

/** close popover when clicking outside */
function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

/* =======================================================
   Types
======================================================= */
type DbComment = {
  id: string;
  created_at: string;
  user_addr: string | null;
  content: string | null;
  parent_id: string | null;
};

type UiNode = {
  id: string;
  createdAt: string;
  addr: string; // lowercase
  name: string;
  text: string;
  likeCount: number;
  likedByMe: boolean;
  parentId: string | null;
  children: UiNode[];
  depth: number;
};

/* =======================================================
   Avatar (DB -> AbstractProfile -> Identicon)
======================================================= */
function AvatarCircle({
  address,
  url,
  size = "lg",
}: {
  address?: string | null;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "h-10 w-10" : size === "md" ? "h-8 w-8" : "h-6 w-6";
  const apSize = size === "lg" ? "md" : size === "md" ? "sm" : "xs";

  if (url) {
    return (
      <div className={`${box} overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700`}>
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(address || "anon")}`;
          }}
        />
      </div>
    );
  }

  if (isAddr(address)) {
    return (
      <div className={`${box} overflow-hidden rounded-full ring-1 ring-neutral-700 bg-neutral-800`}>
        <AbstractProfile address={address} size={apSize as any} showTooltip={false} className={`!${box}`} />
      </div>
    );
  }

  return (
    <div className={`${box} overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700`}>
      <img
        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(address || "anon")}`}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* =======================================================
   Like pill
======================================================= */
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
      ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.03] active:scale-95"}`}
      title={liked ? "Unlike" : "Like"}
    >
      {burst && liked && <span className="pointer-events-none absolute inset-0 -z-10 rounded-full animate-ping bg-violet-500/20" />}
      <svg className={`h-4 w-4 ${liked ? "text-violet-300" : "text-neutral-300"}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
      <span className="text-[13px]">{count}</span>
    </button>
  );
}

/* =======================================================
   Composer
======================================================= */
function Composer({
  onSend,
  placeholder = "Write a reply…",
}: {
  onSend: (text: string) => Promise<void>;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const submit = async () => {
    const v = val.trim();
    if (!v) return;
    await onSend(v);
    setVal("");
  };
  return (
    <div className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/60">
      <textarea
        rows={1}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
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
  );
}

/* =======================================================
   Comment Node (recursive)
   — Vertical ⋮ menu always visible for owner (hidden during edit)
   — While editing: ONLY Save + Cancel are shown (no Like/Reply/toggles)
======================================================= */
function CommentNode({
  node,
  avatarUrl,
  myAddr,
  onToggleLike,
  onReply,
  onEdit,
  onDelete,
  sort,
  getAvatarUrl,
}: {
  node: UiNode;
  avatarUrl?: string | null;
  myAddr?: string | null;
  onToggleLike: (id: string, liked: boolean) => Promise<void>;
  onReply: (parentId: string, text: string) => Promise<void>;
  onEdit: (id: string, newText: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  sort: "newest" | "top";
  getAvatarUrl: (addr: string) => string | null;
}) {
  const [openReply, setOpenReply] = useState(false);
  const [showChildren, setShowChildren] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(node.text);
  useEffect(() => setDraft(node.text), [node.text]);

  const isOwner = !!myAddr && myAddr === node.addr;
  const isActive = openReply || menuOpen || isEditing;

  const sortedKids = useMemo(() => {
    const arr = [...(node.children || [])];
    if (sort === "newest") arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    else arr.sort((a, b) => b.likeCount - a.likeCount || (a.createdAt < b.createdAt ? 1 : -1));
    return arr;
  }, [node.children, sort]);

  const askConnect = () =>
    Swal.fire({
      icon: "info",
      title: "Please connect your wallet",
      text: "Connect or sign in to interact.",
      timer: 1800,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });

  const confirmDelete = async () => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Delete this comment?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });
    if (ok.isConfirmed) {
      await onDelete(node.id);
      setMenuOpen(false);
      Swal.fire({
        icon: "success",
        title: "Comment deleted",
        timer: 1200,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
    }
  };

  const saveEdit = async () => {
    const v = draft.trim();
    if (!v) {
      Swal.fire({
        icon: "warning",
        title: "Content cannot be empty",
        timer: 1200,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
    await onEdit(node.id, v);
    setIsEditing(false);
    setMenuOpen(false);
    Swal.fire({
      icon: "success",
      title: "Comment updated",
      timer: 1000,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  const menuRef = useClickOutside<HTMLDivElement>(menuOpen, () => setMenuOpen(false));

  return (
    <div className="space-y-3">
      {/* Card */}
      <div
        className={[
          "relative group rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition-colors overflow-visible",
          isActive ? "ring-1 ring-[var(--primary-500)]/40 bg-neutral-900" : "hover:bg-neutral-900"
        ].join(" ")}
      >
        {/* left accent */}
        <span
          className={[
            "pointer-events-none absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition",
            isActive ? "bg-[var(--primary-500)]" : "bg-transparent group-hover:bg-[var(--primary-500)]/60"
          ].join(" ")}
        />

        {/* Trigger + Menu (hidden while editing) */}
        {isOwner && !isEditing && (
          <div className="absolute right-2 top-2 z-20 pointer-events-auto" ref={menuRef}>
            <div className="relative h-8 w-8">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More actions"
                aria-haspopup="menu"
                className="absolute inset-0 grid place-items-center rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 outline-none"
              >
                {/* vertical ellipsis */}
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <circle cx="10" cy="4" r="2" />
                  <circle cx="10" cy="10" r="2" />
                  <circle cx="10" cy="16" r="2" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-9 w-40 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-lg"
                >
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                    className="block w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                    role="menuitem"
                  >
                    Edit
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={confirmDelete}
                    className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-800"
                    role="menuitem"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-[40px_1fr] gap-3">
          <AvatarCircle address={node.addr} url={avatarUrl || getAvatarUrl(node.addr)} size="lg" />

          <div>
            {/* pr-10 reserves space for the ⋮ area */}
            <div className="flex flex-wrap items-center gap-2 pr-10">
              <p className="font-semibold text-neutral-50">{node.name}</p>
              <span className="text-sm text-neutral-400">• {relTime(node.createdAt)}</span>
            </div>

            {!isEditing ? (
              <p className="mt-1 text-neutral-50">{node.text}</p>
            ) : (
              <div className="mt-2">
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full resize-y rounded-xl border border-neutral-700 bg-neutral-800/60 p-2 text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
                  placeholder="Edit your comment…"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={saveEdit}
                    className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setDraft(node.text); }}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ACTIONS — hidden while editing */}
            {!isEditing && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <LikePill
                  count={node.likeCount}
                  liked={node.likedByMe}
                  disabled={!myAddr}
                  onClick={() => (myAddr ? onToggleLike(node.id, node.likedByMe) : askConnect())}
                />
                <button
                  onClick={() => (myAddr ? setOpenReply((v) => !v) : askConnect())}
                  className="rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800"
                >
                  Reply
                </button>
                {node.children.length > 0 && (
                  <button
                    onClick={() => setShowChildren((v) => !v)}
                    className="rounded-full px-2 py-1 text-neutral-400 hover:bg-neutral-800"
                  >
                    {showChildren ? "Hide" : `Show ${node.children.length} repl${node.children.length > 1 ? "ies" : "y"}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* reply composer */}
      {openReply && myAddr && (
        <div className="ml-10 flex items-start gap-3">
          <AvatarCircle address={myAddr} url={getAvatarUrl(myAddr)} size="md" />
          <Composer
            onSend={async (text) => { await onReply(node.id, text); setOpenReply(false); setShowChildren(true); }}
          />
        </div>
      )}

      {/* children */}
      {showChildren && node.children.length > 0 && (
        <div className="ml-10 border-l border-neutral-800 pl-4">
          {sortedKids.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              avatarUrl={getAvatarUrl(child.addr)}
              myAddr={myAddr}
              onToggleLike={onToggleLike}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              sort={sort}
              getAvatarUrl={getAvatarUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================================================
   Main Comments
======================================================= */
export default function Comments({
  videoId,
  currentUserAddr,
  isLocked = false,
}: {
  videoId: string;
  currentUserAddr?: string | null;
  isLocked?: boolean;
}) {
  const [sort, setSort] = useState<"top" | "newest">("newest");
  const [roots, setRoots] = useState<UiNode[]>([]);
  const [loading, setLoading] = useState(true);
  const myAddr = (currentUserAddr || "").toLowerCase();

  // address -> avatar_url (DB). if empty, AbstractProfile will be used
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // 1) active comments
        const { data: rows } = await supabase
          .from("video_comments")
          .select("id, created_at, user_addr, content, parent_id")
          .eq("video_id", videoId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        const comments = (rows || []) as DbComment[];
        const ids = comments.map((c) => c.id);

        // 2) likes
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

        // 3) build tree map
        const map = new Map<string, UiNode>();
        const rootsTmp: UiNode[] = [];

        comments.forEach((r) => {
          const addr = (r.user_addr || "anonymous").toLowerCase();
          map.set(r.id, {
            id: r.id,
            createdAt: r.created_at,
            addr,
            name: shortAddr(addr) || "Anonymous",
            text: r.content || "",
            likeCount: likeCountMap.get(r.id) || 0,
            likedByMe: likedByMeSet.has(r.id),
            parentId: r.parent_id,
            children: [],
            depth: 0,
          });
        });

        map.forEach((node) => {
          if (node.parentId && map.has(node.parentId)) {
            const parent = map.get(node.parentId)!;
            node.depth = parent.depth + 1;
            parent.children.push(node);
          } else {
            rootsTmp.push(node);
          }
        });

        if (!alive) return;
        setRoots(rootsTmp);

        // 4) avatar urls from profiles
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

          const mapUrls: Record<string, string> = {};
          (profs || []).forEach((p: any) => {
            const addr = (p?.abstract_id || "").toLowerCase();
            if (addr && p?.avatar_url) mapUrls[addr] = p.avatar_url;
          });

          if (alive) setAvatarMap(mapUrls);
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

  const getAvatarUrl = (addr: string) => avatarMap[addr] || null;

  /* -------- helpers -------- */
  function removeAndPromote(list: UiNode[], targetId: string): UiNode[] {
    const out: UiNode[] = [];
    for (const n of list) {
      if (n.id === targetId) {
        for (const c of n.children) {
          out.push({ ...c, depth: n.depth, parentId: n.parentId });
        }
      } else {
        const newChildren = removeAndPromote(n.children, targetId);
        out.push({ ...n, children: newChildren });
      }
    }
    return out;
  }

  /* -------- actions: delete (soft) -------- */
  const onDelete = async (commentId: string) => {
    if (!myAddr) {
      await Swal.fire({
        icon: "info",
        title: "Please connect your wallet",
        text: "Connect or sign in to interact.",
        timer: 1800,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
    const { error } = await supabase
      .from("video_comments")
      .update({ is_deleted: true, content: "[deleted]" })
      .eq("id", commentId)
      .eq("user_addr", myAddr); // guard

    if (!error) {
      setRoots((prev) => removeAndPromote(prev, commentId));
    } else {
      await Swal.fire({ icon: "error", title: "Failed to delete", text: error.message });
    }
  };

  /* -------- actions: edit -------- */
  const onEdit = async (commentId: string, newText: string) => {
    if (!myAddr) return;
    const { error } = await supabase
      .from("video_comments")
      .update({ content: newText, is_edited: true })
      .eq("id", commentId)
      .eq("user_addr", myAddr);

    if (!error) {
      setRoots((prev) => {
        const clone = structuredClone(prev) as UiNode[];
        const stack: UiNode[] = [...clone];
        while (stack.length) {
          const cur = stack.pop()!;
          if (cur.id === commentId) {
            cur.text = newText;
            break;
          }
          cur.children.forEach((c) => stack.push(c));
        }
        return clone;
      });
    } else {
      await Swal.fire({ icon: "error", title: "Failed to save", text: error.message });
    }
  };

  /* -------- actions: add root comment -------- */
  const onSend = async (text: string) => {
    if (!myAddr) {
      await Swal.fire({
        icon: "info",
        title: "Please connect your wallet",
        text: "Connect your wallet to post a comment.",
        timer: 1800,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, user_addr: myAddr, content: text })
      .select("id, created_at, user_addr, content, parent_id")
      .single();

    if (!error && data) {
      const addrLower = (data.user_addr || "anonymous").toLowerCase();
      const node: UiNode = {
        id: data.id,
        createdAt: data.created_at,
        addr: addrLower,
        name: shortAddr(addrLower) || "Anonymous",
        text: data.content || "",
        likeCount: 0,
        likedByMe: false,
        parentId: null,
        children: [],
        depth: 0,
      };
      setRoots((prev) => [...prev, node]);

      if (!avatarMap[addrLower]) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("abstract_id", addrLower)
          .maybeSingle();
        if (prof?.avatar_url) setAvatarMap((m) => ({ ...m, [addrLower]: prof.avatar_url }));
      }
    }
  };

  /* -------- actions: reply (multi-level) -------- */
  const onReply = async (parentId: string, text: string) => {
    if (!myAddr) {
      await Swal.fire({
        icon: "info",
        title: "Please connect your wallet",
        text: "Connect your wallet to reply.",
        timer: 1800,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
    const { data, error } = await supabase
      .from("video_comments")
      .insert({ video_id: videoId, user_addr: myAddr, content: text, parent_id: parentId })
      .select("id, created_at, user_addr, content, parent_id")
      .single();

    if (!error && data) {
      const addrLower = (data.user_addr || "anonymous").toLowerCase();
      const node: UiNode = {
        id: data.id,
        createdAt: data.created_at,
        addr: addrLower,
        name: shortAddr(addrLower) || "Anonymous",
        text: data.content || "",
        likeCount: 0,
        likedByMe: false,
        parentId: parentId,
        children: [],
        depth: 0,
      };

      setRoots((prev) => {
        const clone = structuredClone(prev) as UiNode[];
        const stack: UiNode[] = [...clone];
        while (stack.length) {
          const cur = stack.pop()!;
          if (cur.id === parentId) {
            node.depth = cur.depth + 1;
            cur.children.unshift(node);
            return clone;
          }
          cur.children.forEach((c) => stack.push(c));
        }
        clone.push(node);
        return clone;
      });

      if (!avatarMap[addrLower]) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("abstract_id", addrLower)
          .maybeSingle();
        if (prof?.avatar_url) setAvatarMap((m) => ({ ...m, [addrLower]: prof.avatar_url }));
      }
    }
  };

  /* -------- actions: like/unlike -------- */
  const onToggleLike = async (commentId: string, liked: boolean) => {
    if (!myAddr) {
      await Swal.fire({
        icon: "info",
        title: "Please connect your wallet",
        text: "Connect or sign in to continue.",
        timer: 1800,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
    if (!liked) {
      const { error } = await supabase.from("video_comment_likes").insert({
        comment_id: commentId,
        user_addr: myAddr,
      });
      if (!error) {
        setRoots((prev) => {
          const c = structuredClone(prev) as UiNode[];
          const stack = [...c];
          while (stack.length) {
            const n = stack.pop()!;
            if (n.id === commentId) {
              n.likeCount += 1;
              n.likedByMe = true;
              break;
            }
            n.children.forEach((ch) => stack.push(ch));
          }
          return c;
        });
      }
    } else {
      const { error } = await supabase
        .from("video_comment_likes")
        .delete()
        .match({ comment_id: commentId, user_addr: myAddr });
      if (!error) {
        setRoots((prev) => {
          const c = structuredClone(prev) as UiNode[];
          const stack = [...c];
          while (stack.length) {
            const n = stack.pop()!;
            if (n.id === commentId) {
              n.likeCount = Math.max(0, n.likeCount - 1);
              n.likedByMe = false;
              break;
            }
            n.children.forEach((ch) => stack.push(ch));
          }
          return c;
        });
      }
    }
  };

  const sortedRoots = useMemo(() => {
    const r = [...roots];
    if (sort === "newest") r.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    else r.sort((a, b) => b.likeCount - a.likeCount || (a.createdAt < b.createdAt ? 1 : -1));
    return r;
  }, [roots, sort]);

  return (
    <div className="w-full border-t border-neutral-800 bg-neutral-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">
          Comments <span className="ml-2 text-base font-normal text-neutral-400">• {roots.length}</span>
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSort((s) => (s === "newest" ? "top" : "newest"))}
            className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
            title="Toggle sort"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm3 4h8a1 1 0 010 2H6a1 1 0 110-2zm3 4h2a1 1 0 010 2H9a1 1 0 110-2z" />
            </svg>
            <span>{sort === "top" ? "Top" : "Newest"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-400">Loading comments…</div>
      ) : isLocked ? (
        <div className="relative min-h-[200px]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
            <div className="bg-neutral-800/80 p-4 rounded-full">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Comments Locked</h3>
              <p className="text-neutral-200">
                Purchase this video to join the discussion
              </p>
            </div>
          </div>

          <div className="opacity-10 pointer-events-none">
            <div className="flex items-start gap-3">
              {isAddr(myAddr) && <AvatarCircle address={myAddr} url={getAvatarUrl(myAddr)} size="lg" />}
              <div className="flex-1">
                <Composer onSend={onSend} placeholder="Write a comment…" />
                {!isAddr(myAddr) && (
                  <p className="mt-2 text-xs text-neutral-400">Connect your wallet to post a comment.</p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {sortedRoots.map((node) => (
                <CommentNode
                  key={node.id}
                  node={node}
                  avatarUrl={getAvatarUrl(node.addr)}
                  myAddr={myAddr}
                  onToggleLike={onToggleLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  sort={sort}
                  getAvatarUrl={getAvatarUrl}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            {isAddr(myAddr) && <AvatarCircle address={myAddr} url={getAvatarUrl(myAddr)} size="lg" />}
            <div className="flex-1">
              <Composer onSend={onSend} placeholder="Write a comment…" />
              {!isAddr(myAddr) && (
                <p className="mt-2 text-xs text-neutral-400">Connect your wallet to post a comment.</p>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {sortedRoots.map((node) => (
              <CommentNode
                key={node.id}
                node={node}
                avatarUrl={getAvatarUrl(node.addr)}
                myAddr={myAddr}
                onToggleLike={onToggleLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                sort={sort}
                getAvatarUrl={getAvatarUrl}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
