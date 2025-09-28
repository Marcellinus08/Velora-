"use client";

import React, { useEffect, useRef, useState } from "react";
import type { NewPostPayload } from "./types";
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

      // Show success alert with Toast
      Swal.fire({
        icon: "success",
        title: "Post Created!",
        text: "Your post was published successfully.",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err: any) {
      alert(err?.message || "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <button
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-50">
            Create New Post
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
            aria-label="Close"
            type="button"
          >
            <MI
              name="close"
              className="text-[16px] leading-none align-middle"
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid max-h-[75vh] grid-rows-[auto_auto_1fr_auto_auto] gap-4 overflow-y-auto pr-1">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                Title
              </label>
              <input
                name="title"
                required
                className="form-input w-full rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
                placeholder="e.g. Tips for consistent knife cuts"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                Category
              </label>
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
              <label className="mb-1 block text-sm text-neutral-300">
                Content
              </label>
              <textarea
                name="content"
                rows={5}
                required
                className="form-textarea w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
                placeholder="Write your question or topic starter…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-neutral-300">
                Attachments (optional)
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  addFiles(e.dataTransfer.files);
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 py-7 text-center hover:border-neutral-500"
                onClick={() => fileRef.current?.click()}
              >
                <MI
                  name="cloud_upload"
                  className="mb-2 text-[24px] opacity-70"
                />
                <div className="text-sm text-neutral-300">
                  Drag &amp; drop file here, or{" "}
                  <span className="text-[var(--primary-500)]">
                    choose a file
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
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
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="group relative overflow-hidden rounded-xl border border-neutral-800"
                    >
                      {it.file.type.startsWith("video/") ? (
                        <video
                          src={it.url}
                          className="h-40 w-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.url}
                          className="h-40 w-full object-cover"
                          alt=""
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"
                        aria-label="Remove"
                      >
                        <MI name="close" className="text-[14px] leading-none" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  // Clean up URL on cancel
                  items.forEach((i) => URL.revokeObjectURL(i.url));
                  setItems([]);
                  onClose();
                }}
                disabled={submitting}
                className={[
                  "group relative inline-flex items-center gap-2 rounded-full px-4 py-2",
                  "text-sm font-semibold transition-all duration-200 ease-out",
                  "text-neutral-200 bg-neutral-700 hover:bg-neutral-600",
                  "hover:-translate-y-0.5 active:translate-y-0",
                  "hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.35)]",
                  "before:content-[''] before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200",
                  "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.15),transparent)] group-hover:before:opacity-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
                  "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
                ].join(" ")}
              >
                {/* shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/15 opacity-0 transition-all duration-300 group-hover:left-[110%] group-hover:opacity-100" />
                </span>
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={[
                  "group relative inline-flex items-center gap-2 rounded-full px-4 py-2",
                  "text-sm font-semibold text-white transition-all duration-200 ease-out",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
                  "hover:-translate-y-0.5 active:translate-y-0",
                  "bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90",
                  "hover:shadow-[0_12px_24px_-6px_rgba(168,85,247,0.45)]",
                  "before:content-[''] before:absolute before:inset-0 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200",
                  "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.25),transparent)] group-hover:before:opacity-100",
                  "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
                ].join(" ")}
              >
                {/* shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/20 opacity-0 transition-all duration-300 group-hover:left-[110%] group-hover:opacity-100" />
                </span>
                {submitting ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
