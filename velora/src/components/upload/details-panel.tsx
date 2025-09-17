"use client";

type Props = {
  /* Details */
  title: string;
  description: string;
  category: string;
  categories: string[];
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeCategory: (v: string) => void;

  /* Pricing */
  priceCents: number;                 // nilai harga saat ini (dalam cents)
  onChangePriceCents: (v: number) => void;

  // optional configs (default: $10–$100, step $1)
  minCents?: number;                  // default 1000
  maxCents?: number;                  // default 10000
  stepCents?: number;                 // default 100

  // opsional: dipakai untuk "Use suggested"
  durationSec?: number;               // durasi video (untuk kalkulasi saran)
};

export default function UploadDetailsPanel({
  title,
  description,
  category,
  categories,
  onChangeTitle,
  onChangeDescription,
  onChangeCategory,

  priceCents,
  onChangePriceCents,
  minCents = 1000,
  maxCents = 10000,
  stepCents = 100,
  durationSec = 0,
}: Props) {
  const dollars = (cents: number) => (cents / 100).toFixed(2);

  // split 60/40
  const creatorEarn = Math.round(priceCents * 0.6);
  const platformFee  = priceCents - creatorEarn;

  // saran harga sederhana berbasis durasi: $10 + $0.50 per menit, dibulatkan ke step
  const suggestPriceCents = () => {
    const minutes = Math.max(1, Math.round(durationSec / 60));
    const raw = 1000 + Math.round(minutes * 50); // 50¢ per menit
    const rounded = Math.round(raw / stepCents) * stepCents;
    return Math.min(Math.max(rounded, minCents), maxCents);
  };

  const applySuggested = () => onChangePriceCents(suggestPriceCents());

  // clamp helper dari input number
  const clampToRangeStep = (vUsd: number) => {
    const cents = Math.round(vUsd * 100);
    const rounded = Math.round(cents / stepCents) * stepCents;
    return Math.min(Math.max(rounded, minCents), maxCents);
  };

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-neutral-200">Details</h3>

      <div className="mt-3 space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Title</label>
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Give your video a descriptive title"
            aria-label="Video title"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            rows={5}
            placeholder="Tell viewers about your video…"
            aria-label="Video description"
            className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Category</label>
          <select
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
            aria-label="Video category"
            className={`w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 focus:border-neutral-500 focus:outline-none ${
              category === "" ? "text-neutral-500" : "text-neutral-100"
            }`}
          >
            <option value="" disabled>
              — Select category —
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== Pricing (slider $10–$100) ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">Pricing</h4>
          <span className="text-xs text-neutral-500">
            Range ${ (minCents/100).toFixed(2) } – ${ (maxCents/100).toFixed(2) } • step ${ (stepCents/100).toFixed(2) }
          </span>
        </div>

        {/* Slider */}
        <div className="mt-3">
          <label htmlFor="price-range" className="mb-1 block text-xs text-neutral-400">
            Set price (USD)
          </label>
          <input
            id="price-range"
            type="range"
            min={minCents}
            max={maxCents}
            step={stepCents}
            value={priceCents}
            onChange={(e) => onChangePriceCents(Number(e.target.value))}
            className="w-full accent-[var(--primary-500)]"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>${(minCents/100).toFixed(2)}</span>
            <span>${(priceCents/100).toFixed(2)}</span>
            <span>${(maxCents/100).toFixed(2)}</span>
          </div>
        </div>

        {/* Three boxes aligned height: Price | Earn/Platform */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 items-stretch">
          {/* LEFT: Price box (patokan tinggi) */}
          <div className="h-full self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2 flex flex-col">
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs text-neutral-400">Price (USD)</label>
              <button
                type="button"
                onClick={applySuggested}
                className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-100 hover:bg-neutral-700"
              >
                Use suggested
              </button>
            </div>

            <input
              type="number"
              min={minCents / 100}
              max={maxCents / 100}
              step={stepCents / 100}
              value={(priceCents / 100).toFixed(2)}
              onChange={(e) => {
                const v = parseFloat(e.target.value || "0");
                if (isNaN(v)) return;
                onChangePriceCents(clampToRangeStep(v));
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              placeholder={`${(minCents/100).toFixed(2)} - ${(maxCents/100).toFixed(2)}`}
            />

            <p className="mt-1 text-xs text-neutral-500">
              Video length: {Math.max(1, Math.round(durationSec / 60))} min
            </p>

            {/* filler agar kartu merentang penuh */}
            <div className="flex-1" />
          </div>

          {/* RIGHT: Earn/Platform box (disamakan tingginya) */}
          <div className="h-full self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">You earn (60%)</span>
              <span className="text-sm font-semibold text-neutral-100">
                ${dollars(creatorEarn)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Platform (40%)</span>
              <span className="text-sm font-semibold text-neutral-100">
                ${dollars(platformFee)}
              </span>
            </div>

            {/* filler supaya tinggi mengikuti kiri */}
            <div className="flex-1" />
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Pilih harga dengan slider (range $10–$100) atau ketik manual. Harga akan dibulatkan ke langkah yang ditentukan.
        </p>
      </div>
    </section>
  );
}
