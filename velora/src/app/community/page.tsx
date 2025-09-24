"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Swal from "sweetalert2";

import Sidebar from "@/components/sidebar";
import CommunityTabs from "@/components/community/tabs";
import CommunityPostRow from "@/components/community/postrow";
import CreatePostModal from "@/components/community/createmodal";
import { CommunityPost, NewPostPayload } from "@/components/community/types";

export default function CommunityPage() {
  const { address } = useAccount();
  const me = (address ?? "").toLowerCase();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("All Topics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  async function safeJson(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await res.json();
    const text = await res.text().catch(() => "");
    throw new Error(`Unexpected response (${res.status}).${text ? ` Body: ${text.slice(0, 200)}` : ""}`);
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs: string[] = [];
      if (category !== "All Topics") qs.push(`category=${encodeURIComponent(category)}`);
      if (me) qs.push(`me=${me}`);
      const res = await fetch(`/api/community/posts${qs.length ? `?${qs.join("&")}` : ""}`, { cache: "no-store" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setPosts((json.posts || []) as CommunityPost[]);
    } catch (e: any) {
      console.error("Load posts failed:", e);
      setError(e?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [category, me]);

  async function handleCreate(data: NewPostPayload) {
    if (!me) return alert("Connect wallet dulu.");
    setError(null);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractId: me, ...data }),
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || res.statusText);
      setOpen(false);
      await load();
    } catch (e: any) {
      console.error("Create post failed:", e);
      setError(e?.message || "Failed to create post");
    }
  }

  async function toggleLike(id: string) {
    if (!me) return alert("Connect wallet dulu.");
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

  // HANYA SweetAlert di sini — tidak ada confirm() lain
  async function handleDelete(id: string) {
    if (!me) return;

    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: "Delete this post?",
      text: "Aksi ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#ef4444",
    });

    if (!isConfirmed) return;

    // Optimistic UI
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

      await Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
    } catch (e: any) {
      console.error("Delete failed:", e);
      setPosts(prev); // rollback
      await Swal.fire({ icon: "error", title: "Gagal menghapus", text: e?.message || "Unknown error" });
    }
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Community Discussions</h2>

            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-opacity-80"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>Create New Post</span>
            </button>
          </div>

          <CommunityTabs value={category} onChange={setCategory} />

          {error && <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">{error}</div>}

          {loading ? (
            <p className="text-neutral-400">Loading…</p>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((p) => (
                <CommunityPostRow
                  key={p.id}
                  post={p}
                  onLike={() => toggleLike(p.id)}
                  currentAddress={me}
                  onDelete={handleDelete}       // hanya parent yang konfirmasi (SweetAlert)
                />
              ))}
              {!posts.length && !error && <p className="text-neutral-400">Belum ada post untuk kategori ini.</p>}
            </div>
          )}
        </div>
      </main>

      <CreatePostModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
