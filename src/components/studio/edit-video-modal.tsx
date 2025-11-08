"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";

/** Modal sederhana untuk edit title & description video.
 *  Saat Save berhasil:
 *   - tampilkan toast notification "Updated!",
 *   - panggil onSaved(updated) agar list langsung berubah TANPA refresh.
 */
export default function EditVideoModal({
  open,
  videoId,
  initialTitle,
  initialDescription,
  onClose,
  onSaved,
}: {
  open: boolean;
  videoId: string;
  initialTitle: string;
  initialDescription: string | null;
  onClose: () => void;
  onSaved?: (v: { id: string; title: string; description: string | null }) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || res.statusText);

      // Success toast notification
      toast.success(
        "Updated!",
        `Video: ${title.trim()}\nYour video has been saved successfully`,
        4000
      );

      onSaved?.({ id: videoId, title: title.trim(), description: description.trim() || null });
    } catch (err: any) {
      toast.error(
        "Update Failed",
        `Error: ${err?.message || "Unknown error"}\nFailed to save video changes`,
        5000
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-50">Edit video</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
            aria-label="Close"
          >
            <span className="material-icons-round text-[16px]">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-300">Title</span>
            <input
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={1}
              maxLength={160}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-neutral-300">Description</span>
            <textarea
              className="h-28 w-full resize-none rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
