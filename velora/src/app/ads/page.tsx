"use client";

import Header from "@/components/header";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/** ====== SIMPLE CONFIG ====== */
const DURATION_DAYS = 7;
const PRICE_USD = 10; // change this to your fixed price
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
/** =========================== */

const PAID_FLAG = "vh_ad_paid_preview_fixed";

export default function CreateAdsPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaURL, setMediaURL] = useState<string | null>(null);

  // Preview payment state
  const [paid, setPaid] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const canPublish = paid && title.trim() !== "" && description.trim() !== "" && media !== null;

  // Restore preview-paid state if user returns
  useEffect(() => {
    if (typeof window === "undefined") return;
    setPaid(sessionStorage.getItem(PAID_FLAG) === "1");
  }, []);

  // Preview object URL for image/video
  useEffect(() => {
    if (!media) {
      if (mediaURL) URL.revokeObjectURL(mediaURL);
      setMediaURL(null);
      return;
    }
    const url = URL.createObjectURL(media);
    setMediaURL(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  function onChooseMedia(e: React.ChangeEvent<HTMLInputElement>) {
    setMedia(e.target.files?.[0] ?? null);
  }

  // Payment preview (UI only)
  function openPaymentPreview() {
    setShowPayModal(true);
  }
  function confirmPaymentPreview() {
    setPaid(true);
    sessionStorage.setItem(PAID_FLAG, "1");
    setShowPayModal(false);
  }

  function onPublish() {
    if (!canPublish) return;
    // Preview only — replace with your real API later.
    alert(
      [
        "Ad created (preview)!",
        `Title: ${title}`,
        `Description: ${description}`,
        `Duration: ${DURATION_DAYS} days`,
        `Price: ${fmtUSD(PRICE_USD)}`,
        `Media: ${media?.name ?? "-"}`,
      ].join("\n")
    );
    router.push("/studio");
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50">Create Advertisement</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Fill in your campaign details. Payment is <span className="font-semibold">preview only</span> for now—no
          charges will be made.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          {/* LEFT: form */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-neutral-200">Campaign Details</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm text-neutral-300">Ad Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                  placeholder="e.g. Learn Photography — 7-Day Promo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-neutral-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                  placeholder="Write a short, compelling description for your ad..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-neutral-300">Upload Media (image/video)</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onChooseMedia}
                  className="w-full rounded-lg border border-dashed border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-100 hover:file:bg-neutral-700"
                />
                {media && (
                  <p className="mt-2 truncate text-xs text-neutral-400">
                    Selected: {media.name} ({Math.round((media.size / 1024 / 1024) * 10) / 10} MB)
                  </p>
                )}

                {/* Tiny preview (image/video) */}
                {mediaURL && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-2">
                    {media?.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaURL}
                        alt="Preview"
                        className="max-h-64 w-full rounded-md object-contain"
                      />
                    ) : (
                      <video
                        src={mediaURL}
                        controls
                        className="max-h-64 w-full rounded-md"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Read-only values (no 'Fixed' label shown) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Duration</label>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100">
                    {DURATION_DAYS} days
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-neutral-300">Price</label>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100">
                    {fmtUSD(PRICE_USD)}
                  </div>
                </div>
              </div>
            </div>
          </section>

            {/* RIGHT: summary + (preview) pay gate */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-200">Payment Summary (Preview)</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Duration</span>
                    <span className="text-neutral-100">{DURATION_DAYS} days</span>
                  </div>
                  <div className="h-px bg-neutral-800" />
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span className="text-neutral-300">Total</span>
                    <span className="text-neutral-50">{fmtUSD(PRICE_USD)}</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    This is a preview. Clicking “Proceed to Payment” opens a demo dialog—no real payment will be processed.
                  </p>
                </div>

                {!paid ? (
                  <button
                    onClick={openPaymentPreview}
                    disabled={title.trim() === "" || description.trim() === "" || media === null}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
                  >
                    Proceed to Payment (Preview)
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
                    Payment marked as complete (preview). You can now publish your ad.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-neutral-200">Publish</h3>
                <p className="mt-2 text-xs text-neutral-500">Make sure all information looks correct.</p>
                <button
                  onClick={onPublish}
                  disabled={!canPublish}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publish Ad
                </button>
              </div>
            </aside>
        </div>
      </main>

      {/* PAYMENT PREVIEW MODAL */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-preview-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="border-b border-neutral-800 px-5 py-4">
              <h4 id="pay-preview-title" className="text-sm font-semibold text-neutral-100">
                Payment Preview
              </h4>
            </div>

            <div className="px-5 py-4 text-sm">
              <p className="text-neutral-300">This is a mock payment step for UI only.</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Total</span>
                  <span className="font-semibold text-neutral-100">{fmtUSD(PRICE_USD)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Duration</span>
                  <span className="text-neutral-100">{DURATION_DAYS} days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
              <button
                onClick={() => setShowPayModal(false)}
                className="rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentPreview}
                className="rounded-lg bg-[var(--primary-500)] px-3 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
              >
                Mark as Paid (Preview)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
