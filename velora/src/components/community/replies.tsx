// src/components/community/replies.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { AbstractProfile } from "@/components/abstract-profile";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add styles to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sweet-alert-container {
      padding-top: 480px !important; /* Increased padding to clear the header */
      z-index: 1000; /* Reduced z-index to stay below header */
    }
    
    .sweet-alert-popup {
      margin: 100 !important;
      position: relative !important;
      top: auto !important;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    @keyframes slideInDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideOutUp {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
    .animated-toast {
      border-radius: 8px !important;
      padding: 12px 24px !important;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      backdrop-filter: blur(8px) !important;
      margin: 12px !important;
    }

    .timer-progress {
      background: linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.4)) !important;
      height: 2px !important;
    }

    .animated-toast .swal2-html-container {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 14px !important;
    }
  `;
  document.head.appendChild(style);
}

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

/* ===== Avatar util with database fallback ===== */
function Avatar({ address, url }: { address: string; url: string | null }) {
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check database for avatar if no url provided
  useEffect(() => {
    if (!url || url.trim() === "") {
      setLoading(true);
      fetch(`/api/profiles/${address.toLowerCase()}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.avatar_url && data.avatar_url.trim() !== "") {
            setDbAvatar(data.avatar_url);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [address, url]);

  // Priority: provided url > database avatar > AbstractProfile
  const avatarUrl = url && url.trim() !== "" ? url : dbAvatar;

  if (avatarUrl) {
    const fallback = `https://api.dicebear.com/7.x/identicon/svg?seed=${address || "anon"}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt="avatar"
        className="h-8 w-8 rounded-full object-cover"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== fallback) el.src = fallback;
        }}
      />
    );
  }

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-neutral-800 animate-pulse" />;
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

/* ===== Material Icon helper (Round) – kecil & rapi baseline ===== */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span
    className={`material-icons-round text-[12px] leading-none align-middle relative top-[1px] ${className}`}
    aria-hidden="true"
  >
    {name}
  </span>
);

export default function Replies({ postId, onPosted, openReplyBox }: { postId: string; onPosted?: () => void; openReplyBox?: boolean }) {
  const { address } = useAccount();
  const me = useMemo(() => (address ? address.toLowerCase() : ""), [address]);
  const { confirm, Dialog } = useConfirmDialog();

  const [items, setItems] = useState<ReplyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showTopReplyBox, setShowTopReplyBox] = useState(openReplyBox ?? false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Update showTopReplyBox when openReplyBox prop changes
  useEffect(() => {
    if (openReplyBox !== undefined) {
      setShowTopReplyBox(openReplyBox);
    }
  }, [openReplyBox]);

  // Fetch current user avatar from database
  useEffect(() => {
    if (me) {
      fetch(`/api/profiles/${me}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.avatar_url && data.avatar_url.trim() !== "") {
            setCurrentUserAvatar(data.avatar_url);
          }
        })
        .catch(() => {});
    }
  }, [me]);

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
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok) throw new Error(j?.error || "Failed to post reply");
      setText("");
      setShowTopReplyBox(false); // Close the reply box after successful submit
      onPosted?.();
      await load();
      // No success toast - removed as per user request
    } catch (e: any) {
      showToast('error', e?.message || "Failed to post reply");
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
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok) throw new Error(j?.error || "Failed");
      const liked = !!j?.liked;
      const likes = Number(j?.likes ?? 0);
      setItems((prev) => prev.map((n) => updateNode(n, id, (node) => ({ ...node, liked, likes }))));
    } catch {
      // silent
    } finally {
      setPendingLikeId(null);
    }
  }

  function updateNode(node: ReplyNode, id: string, fn: (n: ReplyNode) => ReplyNode): ReplyNode {
    if (node.id === id) return fn(node);
    return { ...node, children: node.children.map((c) => updateNode(c, id, fn)) };
  }

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    // Use our custom toast system with appropriate titles
    if (type === 'success') {
      toast.success("Success", message, 4000);
    } else if (type === 'error') {
      toast.error("Error", message, 5000);
    } else {
      toast.info("Warning", message, 4000);
    }
  };

  async function handleEdit(id: string, newContent: string) {
    if (!me || !newContent.trim()) return;
    
    try {
      const r = await fetch(`/api/community/replies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim(), abstractId: me }),
      });
      
      const data = await r.json();
      
      if (!r.ok) {
        throw new Error(data.error || 'Failed to edit reply');
      }

      // Update local state to show the edited content immediately
      setItems((prev) => 
        prev.map((item) => updateNode(item, id, (node) => ({
          ...node,
          content: newContent.trim()
        })))
      );

      // Close edit mode and reload to ensure we have fresh data
      if (editingReplyId === id) {
        setEditingReplyId(null);
      }
      await load();
      
      showToast('success', 'Reply updated successfully');
    } catch (e: any) {
      console.error('Edit error:', e);
      showToast('error', e?.message || 'Failed to edit reply');
      throw e;
    }
  }

  async function handleDelete(id: string) {
    if (!me) return;
    
    // Konfirmasi dengan custom dialog
    const confirmed = await confirm({
      title: "Delete Reply?",
      message: "This action cannot be undone",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;
    
    try {
      const r = await fetch(`/api/community/replies/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abstractId: me }),
      });
      if (!r.ok) throw new Error('Failed to delete reply');
      await load();
      showToast('success', 'Reply deleted successfully');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to delete reply');
    }
  }

  function Item({ node }: { node: ReplyNode }) {
    const [openReplyBox, setOpenReplyBox] = useState(false);
    const [childText, setChildText] = useState("");
    const [showChildren, setShowChildren] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(node.content);
    
    useEffect(() => {
      setEditContent(node.content);
    }, [node.content]);

    async function postChild() {
      if (!me || !childText.trim()) return;
      try {
        const r = await fetch(`/api/community/posts/${postId}/replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractId: me, content: childText.trim(), parentId: node.id }),
        });
        const j = await r.json().catch(() => ({} as any));
        if (!r.ok) throw new Error(j?.error || "Failed to post reply");
        setChildText("");
        setOpenReplyBox(false);
        onPosted?.();
        await load();
        setShowChildren(true);
        // No success toast - removed as per user request
      } catch (e: any) {
        showToast('error', e?.message || "Failed to post reply");
      }
    }

    const likeIcon = node.liked ? "favorite" : "favorite_border";

    return (
      <div className="mt-4 first:mt-0 bg-neutral-900/40 rounded-lg p-3 border border-neutral-800/30">
        <div className="flex items-start gap-3">
          <Avatar address={node.authorAddress} url={node.authorAvatar} />
          <div className="flex-1 min-w-0">
            {/* Header: Author info and menu */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-neutral-100">
                  {node.authorName?.trim() || short(node.authorAddress)}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(node.createdAt).toLocaleString()}
                </span>
              </div>
              
              {/* Menu Options (three dots) - Only show for reply owner */}
              {me === node.authorAddress.toLowerCase() && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 hover:bg-neutral-800 rounded-full cursor-pointer transition-colors">
                    <MI name="more_horiz" className="text-neutral-400 text-lg" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setEditingReplyId(node.id)} 
                      className="cursor-pointer"
                    >
                      <MI name="edit" className="mr-2 text-neutral-400" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(node.id)}
                      className="cursor-pointer text-red-500 focus:text-red-500 hover:text-red-400"
                    >
                      <MI name="delete" className="mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {editingReplyId === node.id ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editContent.trim() && editContent !== node.content) {
                        try {
                          await handleEdit(node.id, editContent);
                          await load();
                        } catch (err) {
                          console.error('Failed to edit:', err);
                        }
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 text-sm text-neutral-50 outline-none focus:border-[var(--primary-500)] transition-colors"
                  rows={2}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingReplyId(null);
                      setEditContent(node.content);
                    }}
                    className="px-3 py-1 text-sm text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await handleEdit(node.id, editContent);
                        await load();
                      } catch (e) {
                        console.error('Failed to edit:', e);
                      }
                    }}
                    disabled={!editContent.trim() || editContent === node.content}
                    className="px-3 py-1.5 text-sm bg-[var(--primary-500)] text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">
                {node.content}
              </div>
            )}

            {/* actions: LIKE + REPLIES + REPLY */}
            <div className="mt-3 flex items-center gap-5 text-xs">
              <button
                onClick={() => toggleLike(node.id)}
                disabled={pendingLikeId === node.id}
                className={
                  "flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer " +
                  (node.liked ? "text-[var(--primary-500)] hover:text-[var(--primary-400)]" : "text-neutral-400 hover:text-neutral-200")
                }
                aria-pressed={!!node.liked}
              >
                <MI name={likeIcon} className="text-base" />
                <span className="font-medium">{node.likes > 0 ? node.likes : ''} {node.likes === 1 ? 'Like' : 'Likes'}</span>
              </button>

              {node.replies > 0 && (
                <button
                  onClick={() => setShowChildren((v) => !v)}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors"
                >
                  <MI name="chat_bubble_outline" className="text-base" />
                  <span className="font-medium">{showChildren ? "Hide" : `${node.replies} ${node.replies === 1 ? 'Reply' : 'Replies'}`}</span>
                </button>
              )}

              <button
                className="flex items-center gap-1.5 text-[var(--primary-500)] hover:text-[var(--primary-400)] cursor-pointer transition-colors font-medium"
                onClick={() => setOpenReplyBox((v) => !v)}
              >
                Reply
              </button>
            </div>

            {/* composer anak */}
            {openReplyBox && (
              <div className="mt-3 ml-0 flex items-start gap-2 p-3 rounded-lg bg-neutral-900/30 border border-neutral-800/50">
                <Avatar address={me} url={currentUserAvatar} />
                <div className="flex-1">
                  <textarea
                    value={childText}
                    onChange={(e) => setChildText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (childText.trim()) {
                          postChild();
                        }
                      }
                    }}
                    rows={2}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-sm text-neutral-50 outline-none focus:border-[var(--primary-500)] transition-colors"
                    placeholder="Write a reply…"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      className="rounded-md px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-800 cursor-pointer transition-colors"
                      onClick={() => {
                        setOpenReplyBox(false);
                        setChildText("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm text-neutral-50 hover:opacity-90 cursor-pointer transition-opacity"
                      onClick={postChild}
                      disabled={!childText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* children (collapse/expand) */}
            {showChildren && node.children?.length > 0 && (
              <div className="mt-4 ml-2 pl-4 border-l-2 border-neutral-800/60 space-y-0">
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
      {showTopReplyBox && (
        <div className="flex items-start gap-3">
          <Avatar address={me} url={currentUserAvatar} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (text.trim()) {
                    postReply(null);
                  }
                }
              }}
              rows={2}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-50 outline-none focus:border-[var(--primary-500)] transition-colors"
              placeholder="Write a reply…"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setText("");
                  setShowTopReplyBox(false);
                }}
                className="rounded-md px-3 py-1 text-neutral-300 hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => postReply(null)}
                disabled={!text.trim()}
                className="rounded-md bg-[var(--primary-500)] px-4 py-1.5 text-sm text-neutral-50 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
      {loading && <p className="mt-3 text-sm text-neutral-400">Loading replies…</p>}

      <div className="mt-3">
        {items.map((n) => (
          <Item key={n.id} node={n} />
        ))}
      </div>

      <Dialog />
    </div>
  );
}
