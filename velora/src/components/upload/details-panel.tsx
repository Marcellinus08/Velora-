"use client";

import type { PriceRule } from "./create";

/* ===== Types for tasks ===== */
type TaskItem = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
};

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
  priceRule: PriceRule;
  priceCents: number;
  onChangePriceCents: (v: number) => void;
  onUseSuggested: () => void;
  durationSec?: number;

  /* Tasks (quiz) */
  tasks: TaskItem[];
  onAddEmptyTask: () => void;
  onChangeTask: (index: number, task: TaskItem) => void;
  onRemoveTask: (index: number) => void;
};

export default function UploadDetailsPanel({
  title,
  description,
  category,
  categories,
  onChangeTitle,
  onChangeDescription,
  onChangeCategory,

  priceRule,
  priceCents,
  onChangePriceCents,
  onUseSuggested,
  durationSec = 0,

  tasks,
  onAddEmptyTask,
  onChangeTask,
  onRemoveTask,
}: Props) {
  const dollars = (cents: number) => (cents / 100).toFixed(2);
  const { min_cents, max_cents, step_cents } = priceRule;

  const creatorEarn = Math.round(priceCents * 0.6);
  const platformFee = priceCents - creatorEarn;

  const clampToRangeStep = (vUsd: number) => {
    const cents = Math.round(vUsd * 100);
    const rounded = Math.round(cents / step_cents) * step_cents;
    return Math.min(Math.max(rounded, min_cents), max_cents);
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

      {/* ===== Pricing ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">Pricing</h4>
          <span className="text-xs text-neutral-500">
            Range ${(min_cents / 100).toFixed(2)} – ${(max_cents / 100).toFixed(2)} • step $
            {(step_cents / 100).toFixed(2)}
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
            min={min_cents}
            max={max_cents}
            step={step_cents}
            value={priceCents}
            onChange={(e) => onChangePriceCents(Number(e.target.value))}
            className="w-full accent-[var(--primary-500)]"
          />
          <div className="mt-1 flex justify-between text-xs text-neutral-500">
            <span>${(min_cents / 100).toFixed(2)}</span>
            <span>${(priceCents / 100).toFixed(2)}</span>
            <span>${(max_cents / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Dua kotak: Price | Earn/Platform (tinggi sejajar) */}
        <div className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
          {/* Kiri: Price box */}
          <div className="flex h-full flex-col self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs text-neutral-400">Price (USD)</label>
              <button
                type="button"
                onClick={onUseSuggested}
                className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-100 hover:bg-neutral-700"
              >
                Use suggested
              </button>
            </div>

            <input
              type="number"
              min={min_cents / 100}
              max={max_cents / 100}
              step={step_cents / 100}
              value={(priceCents / 100).toFixed(2)}
              onChange={(e) => {
                const v = parseFloat(e.target.value || "0");
                if (isNaN(v)) return;
                onChangePriceCents(clampToRangeStep(v));
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              placeholder={`${(min_cents / 100).toFixed(2)} - ${(max_cents / 100).toFixed(2)}`}
            />

            <p className="mt-1 text-xs text-neutral-500">
              Video length: {Math.max(1, Math.round((durationSec || 0) / 60))} min
            </p>

            <div className="flex-1" />
          </div>

          {/* Kanan: Earn/Platform box */}
          <div className="flex h-full flex-col self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2">
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

            <div className="flex-1" />
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Pilih harga dengan slider (range $10–$100) atau ketik manual. Harga akan dibulatkan ke langkah yang ditentukan.
        </p>
      </div>

      {/* ===== Tasks / Quiz ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">Tasks (Quiz)</h4>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Isi pertanyaan & 4 opsi pada setiap blok. Gunakan tombol di bawah untuk menambah soal baru.
        </p>

        <div className="mt-3 space-y-3">
          {tasks.map((t, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">Soal {idx + 1}</p>
                <button
                  type="button"
                  onClick={() => onRemoveTask(idx)}
                  className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                >
                  Remove
                </button>
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-xs text-neutral-400">Question</label>
                <input
                  value={t.question}
                  onChange={(e) => onChangeTask(idx, { ...t, question: e.target.value })}
                  placeholder="Tulis pertanyaan…"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {t.options.map((op, i) => (
                  <div key={i}>
                    <label className="mb-1 block text-xs text-neutral-400">Option {i + 1}</label>
                    <input
                      value={op}
                      onChange={(e) => {
                        const nextOps = [...t.options] as [string, string, string, string];
                        nextOps[i] = e.target.value;
                        onChangeTask(idx, { ...t, options: nextOps });
                      }}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-400">
              Belum ada soal.
            </div>
          )}

          {/* Add question button — kecil & di kanan bawah */}
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onAddEmptyTask}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-opacity-90"
              aria-label="Add question"
              title="Add question"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
              Add question
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
