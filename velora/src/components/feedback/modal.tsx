"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useAccount } from "wagmi";
import { MI } from "@/components/header/MI"; // sesuaikan jika path MI berbeda
import { FeedbackResponse } from "@/types/feedback";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ open, onClose }: Props) {
  const { address } = useAccount(); // Get user's wallet address
  const [type, setType] = useState<"Bug" | "Idea" | "Other">("Bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
        });
        toast.fire({
          icon: "error",
          title: "File size must be less than 5MB",
        });
        return;
      }
      
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        const toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
        });
        toast.fire({
          icon: "error",
          title: "Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM)",
        });
        return;
      }
      
      setMedia(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    // Reset input file
    const fileInput = document.getElementById('media-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || busy) return;

    try {
      setBusy(true);

      const formData = new FormData();
      formData.append('type', type);
      formData.append('message', message.trim());
      formData.append('email', email.trim() || '');
      formData.append('ts', Date.now().toString());
      
      // Add user's wallet address if available
      if (address) {
        formData.append('profile_abstract_id', address.toLowerCase());
      }
      
      if (media) {
        formData.append('media', media);
      }

      // Kirim ke API kamu (buat /api/feedback jika belum ada)
      const r = await fetch("/api/feedback", {
        method: "POST",
        body: formData, // Menggunakan FormData untuk file upload
      });

      if (!r.ok) {
        const j: FeedbackResponse = await r.json().catch(() => ({ success: false, error: "Network error" }));
        throw new Error(j?.error || "Failed to send feedback");
      }

      const result: FeedbackResponse = await r.json();

      // Toast kecil di pojok kanan atas (sesuai preferensi kamu)
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
      await toast.fire({
        icon: "success",
        title: "Thank you for your feedback!",
      });

      // Reset + tutup
      setMessage("");
      setEmail("");
      setType("Bug");
      setMedia(null);
      onClose();
    } catch (err: any) {
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
      await toast.fire({
        icon: "error",
        title: err?.message || "Failed to send feedback",
      });
    } finally {
      setBusy(false);
    }
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
        aria-label="Close backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-50">Send Feedback</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
            aria-label="Close"
            type="button"
          >
            <MI name="close" className="text-[16px] leading-none align-middle" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Bug", "Idea", "Other"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    type === t
                      ? "border-[var(--primary-500)] bg-neutral-800 text-neutral-50"
                      : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Message</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="Describe the issue or your idea…"
            />
          </div>

          {/* Media Upload (optional) */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Attachment (optional)
            </label>
            <div className="space-y-2">
              <input
                id="media-input"
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleMediaChange}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--primary-500)] file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-opacity-90"
              />
              <p className="text-xs text-neutral-400">
                Images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM). Max 5MB.
              </p>
              
              {/* Preview selected file */}
              {media && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800 p-2">
                  <div className="flex items-center gap-2">
                    <MI name={media.type.startsWith('image/') ? 'image' : 'videocam'} className="text-sm text-neutral-400" />
                    <span className="text-sm text-neutral-50 truncate">
                      {media.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({(media.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="rounded-full p-1 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-50"
                    aria-label="Remove file"
                  >
                    <MI name="close" className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="We'll contact you if needed"
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800"
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !message.trim()}
              className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
