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
  onUseSuggested: () => void;

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
  onUseSuggested,

  tasks,
  onAddEmptyTask,
  onChangeTask,
  onRemoveTask,
}: Props) {
  const dollars = (cents: number) => (cents / 100).toFixed(2);

  const { min_cents, max_cents, step_cents } = priceRule;

  // Revenue split 60/40 (creator/platform)
  const creatorEarn = Math.round(priceCents * 0.6);
  const platformFee = priceCents - creatorEarn;

  // Points system (total = price*10)
  const totalPoints = Math.round(priceCents / 10);
  const buyPts = Math.round(totalPoints * 0.4);
  const taskPts = Math.round(totalPoints * 0.2);
  const sharePts = totalPoints - buyPts - taskPts; // sisa agar pas

  // clamp helper dari input number
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

      {/* ===== Pricing ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">Pricing</h4>
          <span className="text-xs text-neutral-500">
            Range ${ (min_cents/100).toFixed(2) } – ${ (max_cents/100).toFixed(2) } • step ${ (step_cents/100).toFixed(2) }
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
            <span>${(min_cents/100).toFixed(2)}</span>
            <span>${(priceCents/100).toFixed(2)}</span>
            <span>${(max_cents/100).toFixed(2)}</span>
          </div>
        </div>

        {/* Two cards (left: price input; right: earnings + points) */}
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
              placeholder={`${(min_cents/100).toFixed(2)} - ${(max_cents/100).toFixed(2)}`}
            />

            <p className="mt-1 text-xs text-neutral-500">
              Video length: {Math.max(1, Math.round(durationSec / 60))} min
            </p>

            <div className="flex-1" />
          </div>

          {/* RIGHT: Earnings + Points (same height) */}
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

            {/* Separator */}
            <div className="my-2 h-px bg-neutral-800" />

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Points (total)</span>
              <span className="text-sm font-semibold text-neutral-100">
                {totalPoints} pts
              </span>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-neutral-400">
              <div className="flex items-center justify-between rounded-md bg-neutral-800/40 px-2 py-1">
                <span>Buy<br/><span className="opacity-70">(40%)</span></span>
                <span className="font-semibold text-neutral-100">{buyPts}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-800/40 px-2 py-1">
                <span>Task<br/><span className="opacity-70">(20%)</span></span>
                <span className="font-semibold text-neutral-100">{taskPts}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-neutral-800/40 px-2 py-1">
                <span>Share<br/><span className="opacity-70">(40%)</span></span>
                <span className="font-semibold text-neutral-100">{sharePts}</span>
              </div>
            </div>

            <div className="flex-1" />
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Points dihitung otomatis dari harga: <strong>points = price × 10</strong>. 
          Split: Buy 40% • Tasks (selesaikan semua) 20% • Share 40%.
        </p>
      </div>

      {/* ===== Tasks (maks 5) ===== */}
      <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-200">
            Tasks / Quiz <span className="text-xs text-neutral-500">(max 5)</span>
          </h4>
          <span className="text-xs text-neutral-500">
            {tasks.length}/5 questions
          </span>
        </div>

        <div className="mt-3 space-y-4">
          {tasks.map((t, idx) => {
            const qLabel = `Soal ${idx + 1}`;
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

                {/* Pertanyaan */}
                <input
                  value={t.question}
                  onChange={(e) =>
                    onChangeTask(idx, { ...t, question: e.target.value })
                  }
                  placeholder="Tulis pertanyaan…"
                  className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
                />

                {/* Opsi + pilih jawaban benar */}
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
                        onChange={() =>
                          onChangeTask(idx, { ...t, answerIndex: oi })
                        }
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

        {/* Add Question (kecil, di paling bawah) */}
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
    </section>
  );
}
