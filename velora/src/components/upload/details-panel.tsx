// src/components/upload/details-panel.tsx
"use client";

type PriceRule = {
  min_cents: number;
  max_cents: number;
  step_cents: number;
  default_cents: number;
};

type TaskItem = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number; // 0..3
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
  durationSec: number;
  priceRule: PriceRule;
  priceCents: number;
  onChangePriceCents: (v: number) => void;
  onUseSuggested: () => void; // kept for compatibility (unused)

  /* Tasks */
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

  durationSec,
  priceRule,
  priceCents,
  onChangePriceCents,
  onUseSuggested, // not used
  tasks,
  onAddEmptyTask,
  onChangeTask,
  onRemoveTask,
}: Props) {
  const dollars = (cents: number) => (cents / 100).toFixed(2);
  const { min_cents, max_cents, step_cents } = priceRule;

  /* earnings */
  const creatorEarn = Math.round(priceCents * 0.6);
  const platformFee = priceCents - creatorEarn;

  /* points: total = price * 10 => cents / 10 */
  const totalPoints = Math.round(priceCents / 10);
  const buyPts = Math.round(totalPoints * 0.4);
  const taskPts = Math.round(totalPoints * 0.2);
  const sharePts = totalPoints - buyPts - taskPts;

  /* helpers */
  const clampToRangeStep = (vUsd: number) => {
    const cents = Math.round(vUsd * 100);
    const rounded = Math.round(cents / step_cents) * step_cents;
    return Math.min(Math.max(rounded, min_cents), max_cents);
  };

  const canAddMoreTasks = tasks.length < 5;

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

      {/* ===== Tasks (max 5) ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">
            Tasks / Quiz <span className="text-xs text-neutral-500">(max 5)</span>
          </h4>
          <span className="text-xs text-neutral-500">{tasks.length}/5 questions</span>
        </div>

        <div className="mt-3 space-y-4">
          {tasks.map((t, idx) => {
            const qLabel = `Question ${idx + 1}`;
            return (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex items-start justify-between gap-2">
                  <label className="text-sm font-medium text-neutral-200">{qLabel}</label>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onRemoveTask(idx)}
                      className="shrink-0 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-100 hover:bg-neutral-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question text */}
                <input
                  value={t.question}
                  onChange={(e) => onChangeTask(idx, { ...t, question: e.target.value })}
                  placeholder="Write the question…"
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                />

                {/* Options + choose correct */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {t.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        t.answerIndex === oi
                          ? "border-[var(--primary-500)] bg-[var(--primary-500)]/10"
                          : "border-neutral-700 bg-neutral-950"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`ans-${idx}`}
                        checked={t.answerIndex === oi}
                        onChange={() => onChangeTask(idx, { ...t, answerIndex: oi })}
                        className="accent-[var(--primary-500)]"
                        aria-label={`Correct option ${oi + 1}`}
                      />
                      <input
                        value={opt}
                        onChange={(e) => {
                          const next = [...t.options] as TaskItem["options"];
                          next[oi] = e.target.value;
                          onChangeTask(idx, { ...t, options: next });
                        }}
                        placeholder={`Option ${oi + 1}`}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Question (small, bottom) */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={!canAddMoreTasks}
            onClick={onAddEmptyTask}
            className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-100 enabled:hover:bg-neutral-700 disabled:opacity-50"
            title={canAddMoreTasks ? "Add question" : "Max 5 questions"}
          >
            + Add
          </button>
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

        {/* Two cards: LEFT (Price+Earnings) | RIGHT (Points improved & fills box) */}
        <div className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
          {/* LEFT: Price + earnings */}
          <div className="flex h-full flex-col self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-3">
            <label className="mb-1 block text-xs text-neutral-400">Price (USD)</label>
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

            <div className="my-2 h-px bg-neutral-800" />

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
          </div>

          {/* RIGHT: Total points — fills the box with balanced spacing */}
          <div className="flex h-full flex-col self-stretch rounded-md border border-neutral-800 bg-neutral-900 p-3">
            {/* Header pill */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Total points</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800/60 px-2.5 py-1 text-sm font-semibold text-neutral-100">
                <svg
                  className="h-4 w-4 text-yellow-400"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
                </svg>
                {totalPoints} pts
              </span>
            </div>

            {/* Middle area grows to fill vertical space */}
            <div className="mt-3 flex flex-1 flex-col justify-center gap-3">
              {/* Segmented progress bar (thicker) */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full bg-[var(--primary-500)]" style={{ width: "40%" }} />
                <div className="h-full bg-yellow-500" style={{ width: "20%" }} />
                <div className="h-full bg-emerald-500" style={{ width: "40%" }} />
              </div>

              {/* Tiny caption under bar */}
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>Buy 40%</span>
                <span>Tasks 20%</span>
                <span>Share 40%</span>
              </div>
            </div>

            {/* Legend chips pinned to bottom (no extra bottom space) */}
            <div className="mt-auto grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center justify-between rounded-md bg-neutral-800/55 px-2 py-1">
                <span className="flex items-center gap-1 text-neutral-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--primary-500)]" fill="currentColor">
                    <path d="M7 4h-2l-1 2v2h2l1 6h10l2-8h-12l-1-2zm1 14a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Buy
                </span>
                <span className="font-semibold text-neutral-100">{buyPts} pts</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-800/55 px-2 py-1">
                <span className="flex items-center gap-1 text-neutral-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-yellow-500" fill="currentColor">
                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2z" />
                  </svg>
                  Tasks
                </span>
                <span className="font-semibold text-neutral-100">{taskPts} pts</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-800/55 px-2 py-1">
                <span className="flex items-center gap-1 text-neutral-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-500" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.95.77L8.91 12.7a3.27 3.27 0 000-1.39l7.02-4.11A3 3 0 1014 5a3 3 0 00.09.72L7.06 9.83a3 3 0 100 4.34l7.05 4.11c-.06.22-.1.46-.1.72a3 3 0 103-3z" />
                  </svg>
                  Share
                </span>
                <span className="font-semibold text-neutral-100">{sharePts} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
