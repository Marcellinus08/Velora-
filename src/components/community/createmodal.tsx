"use client";

import React, { useEffect, useRef, useState } from "react";
import type { NewPostPayload } from "./types";
import { toast } from "@/components/ui/toast";
import Swal from "sweetalert2";

type LocalFile = { id: string; file: File; url: string };

/* Helper icon Material (Round) */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons-round ${className}`} aria-hidden="true">
    {name}
  </span>
);

/** Safe random id: use crypto.randomUUID if available, fallback to random string */
function uid() {
  const c = (globalThis as any)?.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // fallback
  return (
    "id-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}

export default function CreatePostModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewPostPayload) => void;
}) {
  const [items, setItems] = useState<LocalFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Revoke all ObjectURLs when modal closes/unmounts
  useEffect(() => {
    if (!open) return;
    return () => {
      setItems((prev) => {
        prev.forEach((i) => URL.revokeObjectURL(i.url));
        return [];
      });
    };
  }, [open]);

  if (!open) return null;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list).slice(0, 8);
    const next: LocalFile[] = arr.map((f) => ({
      id: uid(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setItems((prev) => [...prev, ...next]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter((x) => x.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    const base: NewPostPayload = {
      title: String(fd.get("title") || ""),
      category: String(fd.get("category") || "All Topics"),
      content: String(fd.get("content") || ""),
    };

    setSubmitting(true);
    try {
      let mediaPaths: string[] = [];

      // Handle file uploads if there are any
      if (items.length) {
        const uf = new FormData();
        items.forEach((i) => uf.append("files", i.file));
        const r = await fetch("/api/community/upload", {
          method: "POST",
          body: uf,
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error || "Upload failed");
        }
        const j = await r.json();
        mediaPaths = (j.items || []).map((x: any) => x.path);
      }

      // Submit the post data including the file paths
      onSubmit({ ...base, mediaPaths });

      // Clean up object URLs after successful submit
      items.forEach((i) => URL.revokeObjectURL(i.url));
      setItems([]);

      // Success notification handled by parent component (page.tsx)
      // Don't show toast here to avoid double notification
    } catch (err: any) {
      // Only show error toast here since parent won't know about upload errors
      toast.error(
        "Failed to Publish",
        `Error: ${err?.message || "Unknown error"}\nPlease try again`,
        5000
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4 max-sm:p-0 max-sm:items-end"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/30 sm:bg-black/70 cursor-pointer"
        onClick={onClose}
      />
      <div className="relative z-[60] w-full max-w-lg sm:rounded-xl max-sm:rounded-t-2xl max-sm:rounded-b-none sm:border border-neutral-700/50 max-sm:border-t max-sm:border-neutral-800 max-sm:border-b-0 bg-neutral-900 shadow-2xl max-sm:max-h-[calc(100vh-4rem)] max-sm:mb-16 max-sm:overflow-hidden max-sm:flex max-sm:flex-col max-sm:animate-slide-up">
        {/* Handle bar - Mobile only */}
        <div className="sm:hidden flex justify-center pt-2 pb-1.5">
          <div className="w-10 h-1 bg-neutral-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 max-sm:px-3 py-3.5 max-sm:py-2.5">
          <h3 className="text-lg max-sm:text-[15px] font-bold text-neutral-50">
            Create New Post
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 max-sm:p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 cursor-pointer transition-colors"
            aria-label="Close"
            type="button"
          >
            <MI
              name="close"
              className="text-[18px] max-sm:text-[16px] leading-none"
            />
          </button>
        </div>
        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-5 max-sm:px-3 py-4 max-sm:py-2.5 flex-1 overflow-y-auto">
          <div className="sm:max-h-[65vh] space-y-4 max-sm:space-y-2.5 sm:overflow-y-auto sm:pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Title */}
            <div>
              <label className="mb-1.5 max-sm:mb-1 block text-sm max-sm:text-[13px] font-medium text-neutral-200">
                Title
              </label>
              <input
                name="title"
                required
                className="w-full rounded-lg max-sm:rounded-md border border-neutral-700 bg-neutral-800/50 px-3 max-sm:px-2.5 py-2 max-sm:py-1.5 text-sm max-sm:text-[13px] text-neutral-50 placeholder:text-neutral-500 focus:border-[var(--primary-500)] focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all"
                placeholder="e.g. Tips for consistent knife cuts"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 max-sm:mb-1 block text-sm max-sm:text-[13px] font-medium text-neutral-200">
                Category
              </label>
              <select
                name="category"
                className="w-full rounded-lg max-sm:rounded-md border border-neutral-700 bg-neutral-800/50 px-3 max-sm:px-2.5 py-2 max-sm:py-1.5 text-sm max-sm:text-[13px] text-neutral-50 focus:border-[var(--primary-500)] focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all cursor-pointer [&>option]:text-neutral-50 [&>option]:bg-neutral-800 [&>option[value='']]:text-neutral-500"
                defaultValue=""
              >
                <option value="">Select a category</option>
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

            {/* Content */}
            <div>
              <label className="mb-1.5 max-sm:mb-1 block text-sm max-sm:text-[13px] font-medium text-neutral-200">
                Content
              </label>
              <textarea
                name="content"
                rows={5}
                required
                className="w-full rounded-lg max-sm:rounded-md border border-neutral-700 bg-neutral-800/50 px-3 max-sm:px-2.5 py-2.5 max-sm:py-2 text-sm max-sm:text-[13px] text-neutral-50 placeholder:text-neutral-500 focus:border-[var(--primary-500)] focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all resize-none"
                placeholder="Write your question or topic starter…"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="mb-1.5 max-sm:mb-1 block text-sm max-sm:text-[13px] font-medium text-neutral-200">
                Attachments <span className="text-neutral-500">(optional)</span>
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl max-sm:rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-800/30 py-8 max-sm:py-4 text-center hover:border-[var(--primary-500)]/50 hover:bg-neutral-800/50 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                <div className="rounded-full bg-neutral-800 p-3 max-sm:p-2 mb-3 max-sm:mb-2">
                  <MI
                    name="cloud_upload"
                    className="text-[28px] max-sm:text-[20px] text-[var(--primary-500)]"
                  />
                </div>
                <div className="text-sm max-sm:text-[12px] font-medium text-neutral-200">
                  Drag & drop file here, or{" "}
                  <span className="text-[var(--primary-500)] hover:underline">
                    choose a file
                  </span>
                </div>
                <div className="mt-2 max-sm:mt-1 text-xs max-sm:text-[11px] text-neutral-500">
                  PNG, JPG, GIF, MP4, WebM (max 25MB)
                </div>
              </div>

              <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={fileRef}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              {!!items.length && (
                <div className="mt-4 max-sm:mt-2.5 grid grid-cols-2 gap-3 max-sm:gap-2 md:grid-cols-3">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="group relative overflow-hidden rounded-lg max-sm:rounded-md border border-neutral-700 bg-neutral-800"
                    >
                      {it.file.type.startsWith("video/") ? (
                        <video
                          src={it.url}
                          className="h-32 max-sm:h-20 w-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.url}
                          className="h-32 max-sm:h-20 w-full object-cover"
                          alt=""
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="absolute right-2 max-sm:right-1 top-2 max-sm:top-1 rounded-full bg-black/70 p-1.5 max-sm:p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 cursor-pointer transition-all"
                        aria-label="Remove"
                      >
                        <MI name="close" className="text-[16px] max-sm:text-[12px] leading-none" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 max-sm:mt-3 flex items-center justify-end gap-3 max-sm:gap-2 max-sm:flex-col border-t border-neutral-800 pt-5 max-sm:pt-2.5 max-sm:pb-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg max-sm:rounded-md px-5 max-sm:px-4 py-2.5 max-sm:py-2 max-sm:w-full text-sm max-sm:text-[13px] font-medium text-white bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2 max-sm:gap-1.5">
                  <svg className="animate-spin h-4 w-4 max-sm:h-3 max-sm:w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing…
                </span>
              ) : (
                "Publish"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                // Clean up URL on cancel
                items.forEach((i) => URL.revokeObjectURL(i.url));
                setItems([]);
                onClose();
              }}
              disabled={submitting}
              className="sm:hidden rounded-lg max-sm:rounded-md px-5 max-sm:px-4 py-2.5 max-sm:py-2 max-sm:w-full text-sm max-sm:text-[13px] font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
