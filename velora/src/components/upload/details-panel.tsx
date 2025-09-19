// src/components/upload/details-panel.tsx
"use client";

import { PriceRule, TaskItem } from "./create"; // sesuaikan path jika struktur berbeda

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

const TASK_POINT_VALUE = 5; // 1 soal = 5 poin

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
  const { min_cents: minCents, max_cents: maxCents, step_cents: stepCents } = priceRule;

  const dollars = (cents: number) => (cents / 100).toFixed(2);

  // split 60/40
  const earnCents = Math.round(priceCents * 0.6);
  const platformCents = priceCents - earnCents;

  // 1 USD = 1 point dari harga
  const pricePoints = Math.round(priceCents / 100);

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

            {/* ===== Tasks (Quiz) ===== */}
      <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">Tasks (Quiz)</h4>
          <span className="text-xs text-neutral-500">Tandai jawaban yang benar</span>
        </div>

        <div className="mt-3 space-y-4">
          {tasks.map((t, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-300">Soal {idx + 1}</span>
                <div className="flex items-center gap-2">
                  {/* Badge poin per soal */}
                  <span className="rounded bg-blue-600/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                    {TASK_POINT_VALUE} pts
                  </span>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveTask(idx)}
                      className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-red-300 hover:bg-neutral-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Pertanyaan */}
              <input
                value={t.question}
                onChange={(e) => onChangeTask(idx, { ...t, question: e.target.value })}
                placeholder="Tulis pertanyaan…"
                className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              />

              {/* Opsi + pilih jawaban benar */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {t.options.map((opt, i) => {
                  const name = `correct-${idx}`;
                  const checked = t.answerIndex === i;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${
                        checked
                          ? "border-green-600/50 bg-green-900/10"
                          : "border-neutral-700 bg-neutral-950"
                      }`}
                    >
                      <input
                        type="radio"
                        name={name}
                        checked={checked}
                        onChange={() => onChangeTask(idx, { ...t, answerIndex: i })}
                        className="accent-[var(--primary-500)]"
                        aria-label={`Opsi ${i + 1} sebagai jawaban benar`}
                      />
                      <input
                        value={opt}
                        onChange={(e) => {
                          const next = [...t.options] as TaskItem["options"];
                          next[i] = e.target.value;
                          onChangeTask(idx, { ...t, options: next });
                        }}
                        placeholder={`Opsi ${i + 1}`}
                        className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                      />
                      {checked && (
                        <span className="rounded bg-green-600/20 px-2 py-0.5 text-[10px] font-medium text-green-300">
                          Correct
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rekap total poin dari tasks */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Total task points ( {tasks.length} soal × {TASK_POINT_VALUE} pts )
          </span>
          <span className="text-sm font-semibold text-neutral-100">
            {tasks.length * TASK_POINT_VALUE} pts
          </span>
        </div>

        {/* Add question di paling bawah, tombol kecil */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onAddEmptyTask}
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
          >
            + Add question
          </button>
        </div>
      </div>

      {/* ===== Pricing ===== */}
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

        {/* Two boxes aligned height: Price | Summary */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 items-stretch">
          {/* LEFT: Price box */}
          <div className="h-full self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2 flex flex-col">
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
              min={minCents / 100}
              max={maxCents / 100}
              step={stepCents / 100}
              value={(priceCents / 100).toFixed(2)}
              onChange={(e) => {
                const v = parseFloat(e.target.value || "0");
                if (!isFinite(v)) return;
                onChangePriceCents(clampToRangeStep(v));
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              placeholder={`${(minCents/100).toFixed(2)} - ${(maxCents/100).toFixed(2)}`}
            />

            <p className="mt-1 text-xs text-neutral-500">
              Video length: {Math.max(1, Math.round(durationSec / 60))} min
            </p>

            <div className="flex-1" />
          </div>

          {/* RIGHT: Earn / Platform / Points dari harga */}
          <div className="h-full self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-2 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">You earn (60%)</span>
              <span className="text-sm font-semibold text-neutral-100">
                ${dollars(earnCents)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Platform (40%)</span>
              <span className="text-sm font-semibold text-neutral-100">
                ${dollars(platformCents)}
              </span>
            </div>

            <div className="my-2 h-px bg-neutral-800" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Points (from price)</span>
              <span className="text-sm font-semibold text-neutral-100">
                +{pricePoints} pts
              </span>
            </div>

            <div className="flex-1" />
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Pilih harga dengan slider atau ketik manual. 1 USD = 1 point (misal $5 → 5 pts).
        </p>
      </div>


    </section>
  );
}
