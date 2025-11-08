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
    <section className="space-y-6">
      {/* Details Section */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Video Details</h3>
            <p className="text-sm text-neutral-400">Fill in the details below</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <label className="text-sm font-semibold text-neutral-200">Title</label>
            </div>
            <input
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="Give your video a descriptive title"
              aria-label="Video title"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <label className="text-sm font-semibold text-neutral-200">Description</label>
            </div>
            <textarea
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              rows={5}
              placeholder="Tell viewers about your video…"
              aria-label="Video description"
              className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              <label className="text-sm font-semibold text-neutral-200">Category</label>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => onChangeCategory(e.target.value)}
                aria-label="Video category"
                className={`peer w-full appearance-none rounded-lg border border-neutral-700/80 bg-neutral-900/90 px-3 py-2 pr-10 shadow-sm backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                  category === "" ? "text-neutral-500" : "text-neutral-100"
                }`}
              >
                <option value="" disabled>
                  — Select a category —
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-neutral-100">
                    {c}
                  </option>
                ))}
              </select>
              {/* Custom arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-neutral-400 peer-focus:text-purple-400 transition-colors"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Tasks (max 5) ===== */}
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">
            Tasks / Quiz <span className="text-xs text-neutral-400">(max 5)</span>
          </h4>
          <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">{tasks.length}/5</span>
        </div>

        <div className="mt-4 space-y-4">
          {tasks.map((t, idx) => {
            const qLabel = `Question ${idx + 1}`;
            return (
              <div key={idx} className="rounded-lg border border-neutral-700/50 bg-neutral-900/60 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                    <label className="text-sm font-semibold text-neutral-200">{qLabel}</label>
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onRemoveTask(idx)}
                      className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-colors"
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
                  className="w-full mb-3 rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
                />

                {/* Options + choose correct */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {t.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-all ${
                        t.answerIndex === oi
                          ? "border-purple-500/50 bg-purple-500/10"
                          : "border-neutral-700 bg-neutral-900/40 hover:border-neutral-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`ans-${idx}`}
                        checked={t.answerIndex === oi}
                        onChange={() => onChangeTask(idx, { ...t, answerIndex: oi })}
                        className="accent-purple-500"
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
                        className="flex-1 rounded-md border border-neutral-700 bg-transparent px-2 py-1 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Question (small, bottom) */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            disabled={!canAddMoreTasks}
            onClick={onAddEmptyTask}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium text-sm enabled:hover:shadow-lg enabled:hover:shadow-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            title={canAddMoreTasks ? "Add question" : "Max 5 questions"}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Question
          </button>
        </div>
      </div>

      {/* ===== Pricing ===== */}
      <div className="mt-5 rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">Pricing</h4>
          <span className="text-xs text-neutral-400">
            Range ${(min_cents / 100).toFixed(2)} – ${(max_cents / 100).toFixed(2)} • step $
            {(step_cents / 100).toFixed(2)}
          </span>
        </div>

        {/* Slider */}
        <div className="mt-4">
          <label htmlFor="price-range" className="mb-2 block text-xs font-semibold text-neutral-300">
            Adjust price (USD)
          </label>
          <input
            id="price-range"
            type="range"
            min={min_cents}
            max={max_cents}
            step={step_cents}
            value={priceCents}
            onChange={(e) => onChangePriceCents(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
            <div className="mt-2 flex justify-between text-xs text-neutral-400">
            <span>${(min_cents / 100).toFixed(2)}</span>
            <span className="font-bold text-purple-300">${(priceCents / 100).toFixed(2)}</span>
            <span>${(max_cents / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Two cards: LEFT (Price+Earnings) | RIGHT (Points improved & fills box) */}
        <div className="mt-4 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
          {/* LEFT: Price + earnings */}
          <div className="flex h-full flex-col self-stretch rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4">
            <label className="mb-2 block text-xs font-semibold text-neutral-300">Price (USD)</label>
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
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              placeholder={`${(min_cents / 100).toFixed(2)} - ${(max_cents / 100).toFixed(2)}`}
            />

            <div className="my-3 h-px bg-neutral-700/50" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">You earn (60%)</span>
              <span className="text-sm font-bold text-purple-300">
                ${dollars(creatorEarn)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Platform (40%)</span>
              <span className="text-sm font-semibold text-neutral-300">
                ${dollars(platformFee)}
              </span>
            </div>
          </div>

          {/* RIGHT: Total points — fills the box with balanced spacing */}
          <div className="flex h-full flex-col self-stretch rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-4">
            {/* Header pill */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-300">Total points</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-sm font-bold text-amber-300 border border-amber-500/30">
                <svg
                  className="h-4 w-4"
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
            <div className="mt-2 flex flex-1 flex-col justify-center gap-3">
              {/* Segmented progress bar (thicker) */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-800/50">
                <div className="h-full bg-purple-500" style={{ width: "40%" }} />
                <div className="h-full bg-amber-500" style={{ width: "20%" }} />
                <div className="h-full bg-emerald-500" style={{ width: "40%" }} />
              </div>

              {/* Tiny caption under bar */}
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Buy 40%</span>
                <span>Tasks 20%</span>
                <span>Share 40%</span>
              </div>
            </div>

            {/* Legend chips pinned to bottom (no extra bottom space) */}
            <div className="mt-auto grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center justify-between rounded-md bg-purple-500/10 px-2 py-1.5 border border-purple-500/20">
                <span className="flex items-center gap-1 text-purple-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M7 4h-2l-1 2v2h2l1 6h10l2-8h-12l-1-2zm1 14a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  Buy
                </span>
                <span className="font-bold text-purple-200">{buyPts}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2 py-1.5 border border-amber-500/20">
                <span className="flex items-center gap-1 text-amber-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2z" />
                  </svg>
                  Tasks
                </span>
                <span className="font-bold text-amber-200">{taskPts}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-emerald-500/10 px-2 py-1.5 border border-emerald-500/20">
                <span className="flex items-center gap-1 text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.95.77L8.91 12.7a3.27 3.27 0 000-1.39l7.02-4.11A3 3 0 1014 5a3 3 0 00.09.72L7.06 9.83a3 3 0 100 4.34l7.05 4.11c-.06.22-.1.46-.1.72a3 3 0 103-3z" />
                  </svg>
                  Share
                </span>
                <span className="font-bold text-emerald-200">{sharePts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
