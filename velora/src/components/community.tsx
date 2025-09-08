// src/components/community.tsx
"use client";

import React from "react";

/* =========================
   Types
========================= */
export type CommunityPost = {
  authorName: string;
  authorAvatar: string; // pakai background-image biar tak perlu next/image config
  category: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  likes: number;
  replies: number;
  liked?: boolean;
};

export type NewPostPayload = {
  title: string;
  category: string;
  content: string;
};

/* =========================
   Tabs (kategori)
========================= */
export function CommunityTabs() {
  const tabs = [
    "All Topics",
    "Cooking",
    "Business",
    "Music",
    "Arts & Crafts",
    "Development",
    "Fitness",
    "Photography",
  ];
  return (
    <div className="border-b border-neutral-800">
      <div className="flex items-center gap-x-2 overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={[
              "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
              i === 0
                ? "border-[var(--primary-500)] text-neutral-50"
                : "border-transparent text-neutral-400 hover:border-neutral-700 hover:text-neutral-50",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================
   Satu baris post
========================= */
export function CommunityPostRow({ post }: { post: CommunityPost }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800">
      <div className="flex items-start gap-4">
        <div
          className="aspect-square size-10 rounded-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${post.authorAvatar}")` }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-50">{post.authorName}</p>
              <p className="text-sm text-neutral-400">
                posted in <span className="font-medium text-neutral-50">{post.category}</span>
              </p>
            </div>
            <p className="text-sm text-neutral-400">{post.timeAgo}</p>
          </div>

          <h3 className="mt-2 text-lg font-bold text-neutral-50">{post.title}</h3>
          <p className="mt-1 text-neutral-400">{post.excerpt}</p>

          <div className="mt-4 flex items-center gap-6 text-sm text-neutral-400">
            <button
              className={
                "flex items-center gap-1.5 hover:text-neutral-50 " +
                (post.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
              }
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M14 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M10 4.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
              </svg>
              <span>{post.likes} Likes</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-neutral-50">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.replies} Replies</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-neutral-50">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Modal Create New Post
========================= */
export function CreatePostModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewPostPayload) => void;
}) {
  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      title: String(fd.get("title") || ""),
      category: String(fd.get("category") || "All Topics"),
      content: String(fd.get("content") || ""),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-50">Create New Post</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
            aria-label="Close"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Title</label>
            <input
              name="title"
              required
              className="form-input w-full rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="e.g. Tips for consistent knife cuts"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">Category</label>
            <select
              name="category"
              className="form-select w-full rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 focus:border-[var(--primary-500)] focus:ring-0"
              defaultValue="Cooking"
            >
              <option>All Topics</option>
              <option>Cooking</option>
              <option>Business</option>
              <option>Music</option>
              <option>Arts & Crafts</option>
              <option>Development</option>
              <option>Fitness</option>
              <option>Photography</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">Content</label>
            <textarea
              name="content"
              rows={5}
              required
              className="form-textarea w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="Write your question or topic starter…"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
