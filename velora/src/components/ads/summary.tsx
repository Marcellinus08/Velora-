"use client";

import type { SummaryProps } from "./types";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AdSummary({
  paid,
  canPublish,
  priceUsd,
  durationDays,
  onOpenPayment,
  onPublish,
}: SummaryProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-neutral-200">Payment Summary (Preview)</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Duration</span>
            <span className="text-neutral-100">{durationDays} days</span>
          </div>
          <div className="h-px bg-neutral-800" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-neutral-300">Total</span>
            <span className="text-neutral-50">{fmtUSD(priceUsd)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            This is a preview. Clicking “Proceed to Payment” opens a demo dialog—no real payment will be processed.
          </p>
        </div>

        {!paid ? (
          <button
            onClick={onOpenPayment}
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
  );
}
