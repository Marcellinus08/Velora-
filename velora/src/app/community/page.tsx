"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

import Sidebar from "@/components/sidebar";
import { CommunityEmptyState } from "@/components/community/empty-state";
import { CommunityPageSkeleton } from "@/components/skeletons/community-skeleton";
import { CommunityPost, NewPostPayload } from "@/components/community/types";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

// Lazy load heavy components
const CommunityTabs = dynamic(() => import("@/components/community/tabs"), {
  loading: () => <div className="h-20 rounded-xl bg-neutral-800/50 animate-pulse" />,
  ssr: true,
});

const CommunityLazy = dynamic(
  () => import("@/components/community/community-lazy").then((mod) => ({ default: mod.CommunityLazy })),
  {
    loading: () => <div className="h-96 rounded-xl bg-neutral-800/50 animate-pulse" />,
    ssr: true,
  }
);

const CreatePostModal = dynamic(() => import("@/components/community/createmodal"), {
  loading: () => null,
  ssr: true,
});

export default function CommunityPage() {
  const { address } = useAccount();
  const me = (address ?? "").toLowerCase();
  const { confirm, Dialog } = useConfirmDialog();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("All Topics");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  async function safeJson(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await res.json();
    const text = await res.text().catch(() => "");
    throw new Error(`Unexpected response (${res.status}).${text ? ` Body: ${text.slice(0, 200)}` : ""}`);
  }

  async function loadInitial() {
    setLoading(true);
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setError(null);
    try {
      const qs: string[] = ["page=1"];
      if (category !== "All Topics") qs.push(`category=${encodeURIComponent(category)}`);
      if (me) qs.push(`me=${me}`);
      const res = await fetch(`/api/community/posts?${qs.join("&")}`, { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      const newPosts = (json.posts || []) as CommunityPost[];
      setPosts(newPosts);
      setHasMore(newPosts.length === 5); // If got less than 5, no more pages
    } catch (e: any) {
      console.error("Load posts failed:", e);
      setError(e?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const fetchMore = useCallback(async () => {
    try {
      const nextPage = page + 1;
      const qs: string[] = [`page=${nextPage}`];
      if (category !== "All Topics") qs.push(`category=${encodeURIComponent(category)}`);
      if (me) qs.push(`me=${me}`);
      const res = await fetch(`/api/community/posts?${qs.join("&")}`, { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      const newPosts = (json.posts || []) as CommunityPost[];
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(newPosts.length === 5);
      }
    } catch (e: any) {
      console.error("Load more posts failed:", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, category, me]);

  const handleFetchMore = useCallback(async () => {
    setLoadingMore(true);
    await fetchMore();
  }, [fetchMore]);

  // Hook infinite scroll - trigger fetchMore saat user scroll ke bawah
  const observerTarget = useInfiniteScroll(handleFetchMore, hasMore && !loading);

  useEffect(() => {
    void loadInitial();
  }, [category, me]);

  async function handleCreate(data: NewPostPayload) {
    if (!me) {
      toast.error(
        "Wallet Not Connected",
        "Please connect your wallet to create posts\nSign in to start posting",
        5000
      );
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me, ...data }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || res.statusText);
      
      // Show success notification
      toast.success(
        "Post Created!",
        `Category: ${data.category}\nYour post was published successfully`,
        5000
      );
      
      setOpen(false);
      await loadInitial();
    } catch (e: any) {
      console.error("Create post failed:", e);
      setError(e?.message || "Failed to create post");
      toast.error(
        "Failed to Create Post",
        `Error: ${e?.message || "Unknown error"}\nPlease try again`,
        5000
      );
    }
  }

  async function toggleLike(id: string) {
    if (!me) {
      toast.error(
        "Wallet Not Connected",
        "Please connect your wallet to like posts\nSign in to interact with content",
        5000
      );
      return;
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
    );
    try {
      const res = await fetch(`/api/community/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || res.statusText);
    } catch (e) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
      );
      setError("Gagal menyimpan like. Coba lagi.");
    }
  }

  // ✅ Hanya SweetAlert
  async function handleEdit({ postId, title, content }: { postId: string; title: string; content: string }) {
    if (!me) return;

    const prevPosts = [...posts];
    
    // Optimistic update
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId
          ? { ...p, title, content }
          : p
      )
    );

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          abstractId: me,
          title: title.trim(),
          content: content.trim()
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      // Toast notification untuk sukses
      toast.success(
        "Changes saved!",
        `Post updated successfully\nYour changes have been saved`,
        4000
      );
    } catch (e: any) {
      console.error("Edit failed:", e);
      // Rollback on error
      setPosts(prevPosts);
      
      // Toast notification untuk error
      toast.error(
        "Failed to save changes",
        `Error: ${e?.message || "Unknown error"}\nPlease try again`,
        5000
      );
    }
  }

  async function handleDelete(id: string) {
    if (!me) return;

    const confirmed = await confirm({
      title: "Delete this post?",
      message: "This action cannot be undone.",
      confirmText: "Yes, delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    const prev = posts;
    setPosts((p) => p.filter((x) => x.id !== id));

    try {
      const res = await fetch(`/api/community/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || res.statusText);

      // Toast notification untuk sukses
      toast.success(
        "Post deleted successfully",
        "Your post has been removed from the community",
        4000
      );
    } catch (e: any) {
      console.error("Delete failed:", e);
      setPosts(prev);
      // Toast notification untuk error
      toast.error(
        "Failed to delete post",
        `Error: ${e?.message || "Unknown error"}\nPlease try again`,
        5000
      );
    }
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 md:ml-64">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-50">Community Discussions</h2>
              <p className="text-sm text-neutral-400 mt-1">Share ideas, ask questions, and engage with the community</p>
            </div>

            {address && (
              <button
                onClick={() => setOpen(true)}
                className="cursor-pointer flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]/40"
              >
                <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Create New Post</span>
              </button>
            )}
          </div>

          <CommunityTabs value={category} onChange={setCategory} />

          {error && <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">{error}</div>}

          {/* Loading State dengan Skeleton */}
          {loading ? (
            <CommunityPageSkeleton count={5} />
          ) : posts.length === 0 ? (
            <CommunityEmptyState category={category} />
          ) : (
            <>
              <CommunityLazy
                allPosts={posts}
                isLoading={loading}
                currentAddress={me}
                onLike={toggleLike}
                onDelete={handleDelete}
                onEdit={handleEdit}
                error={error}
              />
              
              {/* Loading indicator saat fetch more */}
              {loadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary-500)] border-t-transparent" />
                    <span className="text-sm text-neutral-400">Loading more posts...</span>
                  </div>
                </div>
              )}
              
              {/* Observer target untuk infinite scroll */}
              <div ref={observerTarget} className="h-10 w-full" />
            </>
          )}
        </div>
      </main>

      <CreatePostModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreate} />
      <Dialog />
    </div>
  );
}
