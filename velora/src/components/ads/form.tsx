"use client";

import type { FormProps } from "./types";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AdForm({
  title,
  description,
  media,
  mediaURL,
  durationDays,
  priceUsd,
  onChangeTitle,
  onChangeDesc,
  onChooseMedia,
}: FormProps) {
  function handleChoose(e: React.ChangeEvent<HTMLInputElement>) {
    onChooseMedia(e.target.files?.[0] ?? null);
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-200">Campaign Details</h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Ad Title</label>
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
            placeholder="e.g. Learn Photography — 7-Day Promo"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-neutral-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => onChangeDesc(e.target.value)}
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
            onChange={handleChoose}
            className="w-full rounded-lg border border-dashed border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-neutral-100 hover:file:bg-neutral-700"
          />
          {media && (
            <p className="mt-2 truncate text-xs text-neutral-400">
              Selected: {media.name} ({Math.round((media.size / 1024 / 1024) * 10) / 10} MB)
            </p>
          )}

          {mediaURL && (
            <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 p-2">
              {media?.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaURL} alt="Preview" className="max-h-64 w-full rounded-md object-contain" />
              ) : (
                <video src={mediaURL} controls className="max-h-64 w-full rounded-md" />
              )}
            </div>
          )}
        </div>

        {/* Read-only values */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Duration</label>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100">
              {durationDays} days
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">Price</label>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100">
              {fmtUSD(priceUsd)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
