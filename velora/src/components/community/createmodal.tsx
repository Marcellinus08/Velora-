"use client";

import React from "react";
import { NewPostPayload } from "./types";

export default function CreatePostModal({
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
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
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
