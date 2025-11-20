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
  const [category, setCategory] = useState<string>("All");
  const [sortMode, setSortMode] = useState<"latest" | "trending">("latest");
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
      // If trending mode, use trending API
      if (sortMode === "trending") {
        const qs: string[] = [];
        if (category !== "All") qs.push(`category=${encodeURIComponent(category)}`);
        if (me) qs.push(`me=${me}`);
        const res = await fetch(`/api/community/trending?${qs.join("&")}`, { cache: "no-store" });
        const json = await safeJson(res);
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        const trendingPosts = (json.posts || []) as CommunityPost[];
        setPosts(trendingPosts);
        setHasMore(false); // Trending is limited to 10, no pagination
        return;
      }

      // Latest mode - normal pagination
      const qs: string[] = ["page=1"];
      if (category !== "All") qs.push(`category=${encodeURIComponent(category)}`);
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
      if (category !== "All") qs.push(`category=${encodeURIComponent(category)}`);
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
    if (sortMode === "trending") return; // No pagination for trending
    setLoadingMore(true);
    await fetchMore();
  }, [fetchMore, sortMode]);

  // Hook infinite scroll - trigger fetchMore saat user scroll ke bawah
  // Disable for trending mode
  const observerTarget = useInfiniteScroll(handleFetchMore, hasMore && !loading && sortMode === "latest");

  useEffect(() => {
    void loadInitial();
  }, [category, me, sortMode]);

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
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden xl:ml-64 max-sm:px-3 max-sm:py-3 max-sm:pb-20 xl:pb-6">
        <div className="flex flex-col gap-6 max-sm:gap-4 max-sm:max-w-full md:gap-5">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between max-sm:gap-3 md:gap-4">
            <div className="max-sm:w-full">
              <h2 className="text-2xl font-bold text-neutral-50 max-sm:text-lg md:text-xl">Community Discussions</h2>
              <p className="text-sm text-neutral-400 mt-1 max-sm:text-xs max-sm:mt-0.5 md:text-sm md:mt-1">Share ideas, ask questions, and engage with the community</p>
            </div>

            <div className="flex items-center gap-2 max-sm:w-full max-sm:flex-col">
              {/* Sort Toggle */}
              <div className="flex items-center gap-1 bg-neutral-800/60 border border-neutral-700/50 rounded-full p-1 max-sm:w-full">
                <button
                  onClick={() => setSortMode("latest")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 max-sm:flex-1 max-sm:px-2 max-sm:py-1 ${
                    sortMode === "latest"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortMode("trending")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 max-sm:flex-1 max-sm:px-2 max-sm:py-1 ${
                    sortMode === "trending"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Trending
                </button>
              </div>

              {address && (
                <button
                  onClick={() => setOpen(true)}
                  className="cursor-pointer flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]/40 max-sm:w-full max-sm:justify-center max-sm:px-4 max-sm:py-2.5 max-sm:text-sm max-sm:rounded-lg md:rounded-full md:px-4 md:py-2 md:text-sm md:w-auto"
                >
                  <svg className="size-5 max-sm:size-4 md:size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create New Post</span>
                </button>
              )}
            </div>
          </div>

          <CommunityTabs value={category} onChange={setCategory} />

          {error && <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200 max-sm:p-2 max-sm:text-xs max-sm:rounded-lg md:p-3 md:text-sm md:rounded-md">{error}</div>}

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
                <div className="flex justify-center items-center py-8 max-sm:py-4 md:py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary-500)] border-t-transparent max-sm:h-4 max-sm:w-4 md:h-5 md:w-5" />
                    <span className="text-sm text-neutral-400 max-sm:text-xs md:text-sm">Loading more posts...</span>
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
