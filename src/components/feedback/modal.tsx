"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";
import { useAccount } from "wagmi";
import { MI } from "@/components/header/MI"; // sesuaikan jika path MI berbeda
import { FeedbackResponse } from "@/types/feedback";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ open, onClose }: Props) {
  const { address } = useAccount(); // Get user's wallet address
  const [type, setType] = useState<"Bug" | "Idea" | "Other">("Idea");
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
        toast.error(
          "File Too Large",
          "File size must be less than 5MB\nPlease choose a smaller file",
          4000
        );
        return;
      }
      
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid File Type",
          "Please upload images (JPEG, PNG, GIF, WebP)\nor videos (MP4, WebM)",
          4000
        );
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

      // Success toast notification
      toast.success(
        "Thank you for your feedback!",
        `Type: ${type}\nYour feedback has been submitted successfully`,
        5000
      );

      // Reset + tutup
      setMessage("");
      setEmail("");
      setType("Idea");
      setMedia(null);
      onClose();
    } catch (err: any) {
      toast.error(
        "Submission Failed",
        `Error: ${err?.message || "Unknown error"}\nFailed to send feedback`,
        5000
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4 max-sm:p-0 max-sm:items-end"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* Backdrop */}
      <button
        aria-label="Close backdrop"
        className="absolute inset-0 bg-black/30 sm:bg-black/60 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal - Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div className="relative z-[60] w-full max-w-md sm:rounded-2xl max-sm:rounded-t-2xl max-sm:rounded-b-none sm:border border-neutral-800 max-sm:border-t max-sm:border-neutral-800 max-sm:border-b-0 bg-neutral-900 p-5 sm:p-5 max-sm:p-4 shadow-xl max-sm:max-h-[75vh] overflow-y-auto max-sm:animate-slide-up">
        {/* Handle bar - Mobile only */}
        <div className="sm:hidden flex justify-center pb-2 -mt-2">
          <div className="w-10 h-1 bg-neutral-700 rounded-full" />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg max-sm:text-base font-semibold text-neutral-50">Send Feedback</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 max-sm:p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50 cursor-pointer"
            aria-label="Close"
            type="button"
          >
            <MI name="close" className="text-[16px] max-sm:text-[14px] leading-none align-middle" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-sm:space-y-3">
          {/* Type */}
          <div>
            <label className="mb-1 max-sm:mb-0.5 block text-sm max-sm:text-xs text-neutral-300">Type</label>
            <div className="grid grid-cols-3 gap-2 max-sm:gap-1.5">
              {(["Idea", "Bug", "Other"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-3 py-2 max-sm:px-2 max-sm:py-1.5 text-sm max-sm:text-xs cursor-pointer ${
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
            <label className="mb-1 max-sm:mb-0.5 block text-sm max-sm:text-xs text-neutral-300">Message</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 max-sm:p-2 text-neutral-50 max-sm:text-sm placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="Describe the issue or your idea…"
            />
          </div>

          {/* Media Upload (optional) */}
          <div>
            <label className="mb-1 max-sm:mb-0.5 block text-sm max-sm:text-xs text-neutral-300">
              Attachment (optional)
            </label>
            <div className="space-y-2 max-sm:space-y-1.5">
              <input
                id="media-input"
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleMediaChange}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 max-sm:px-2 max-sm:py-1.5 text-neutral-50 max-sm:text-sm file:mr-3 max-sm:file:mr-2 file:rounded-md file:border-0 file:bg-[var(--primary-500)] file:px-3 file:py-1 max-sm:file:px-2 max-sm:file:py-0.5 file:text-sm max-sm:file:text-xs file:text-white hover:file:bg-opacity-90 file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs max-sm:text-[10px] text-neutral-400">
                Images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM). Max 5MB.
              </p>
              
              {/* Preview selected file */}
              {media && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800 p-2 max-sm:p-1.5 max-sm:flex-col max-sm:gap-2">
                  <div className="flex items-center gap-2 max-sm:gap-1.5 max-sm:w-full">
                    <MI name={media.type.startsWith('image/') ? 'image' : 'videocam'} className="text-sm max-sm:text-xs text-neutral-400 max-sm:flex-shrink-0" />
                    <span className="text-sm max-sm:text-xs text-neutral-50 truncate">
                      {media.name}
                    </span>
                    <span className="text-xs max-sm:text-[10px] text-neutral-400 max-sm:flex-shrink-0">
                      ({(media.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="rounded-full p-1 max-sm:p-0.5 max-sm:w-full max-sm:bg-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-50 cursor-pointer max-sm:text-xs"
                    aria-label="Remove file"
                  >
                    <MI name="close" className="text-sm max-sm:text-xs max-sm:inline" />
                    <span className="hidden max-sm:inline ml-1">Remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Email (optional) */}
          <div>
            <label className="mb-1 max-sm:mb-0.5 block text-sm max-sm:text-xs text-neutral-300">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 max-sm:px-2 max-sm:py-1.5 text-neutral-50 max-sm:text-sm placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="We'll contact you if needed"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 max-sm:flex-col max-sm:gap-2 max-sm:pb-20">
            <button
              type="submit"
              disabled={busy || !message.trim()}
              className="rounded-full bg-[var(--primary-500)] px-4 py-2 max-sm:px-3 max-sm:py-2.5 max-sm:w-full text-sm max-sm:text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {busy ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 max-sm:px-3 max-sm:py-2 max-sm:w-full text-sm max-sm:text-sm font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-750 cursor-pointer sm:hidden"
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
