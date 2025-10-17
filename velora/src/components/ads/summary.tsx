// src/components/ads/summary.tsx
"use client";

import { TREASURY_ADDRESS } from "@/config/abstract-contracts";
// Jika sudah dipisah file tombolnya, ganti import ke "@/components/payments/PayAdsButton"
import { PayAdsButton } from "@/components/payments/TreasuryButtons";
import type { SummaryProps } from "./types";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AdSummary({
  paid,
  canPublish,
  priceUsd,
  durationDays,
  onOpenPayment, // fallback (preview) bila on-chain belum aktif
  onPublish,
  campaignId,    // opsional
  onPaid,        // opsional — dipanggil saat tx sukses
  payDisabled,   // opsional — kunci tombol pay sampai form valid
}: SummaryProps) {
  const canPayOnChain = Boolean(TREASURY_ADDRESS) && priceUsd > 0;

  // Publish aktif jika SUDAH dibayar & form valid (parent sudah hitung canPublish)
  const readyToPublish = paid && canPublish;

  // util untuk kelas disabled yang konsisten
  const disabledCls =
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

  return (
    <aside className="space-y-4">
      {/* Payment Summary */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-neutral-200">Payment Summary</h3>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Duration</span>
            <span className="text-neutral-100">
              {durationDays} {durationDays > 1 ? "days" : "day"}
            </span>
          </div>

          <div className="h-px bg-neutral-800" />

          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-neutral-300">Total</span>
            <span className="text-neutral-50">{fmtUSD(priceUsd)}</span>
          </div>

          {!canPayOnChain && (
            <p className="mt-2 text-xs text-amber-300">
              On-chain payment nonaktif{" "}
              {!TREASURY_ADDRESS ? (
                <>
                  karena <code>NEXT_PUBLIC_TREASURY_ADDRESS</code> belum diisi
                </>
              ) : (
                <>karena total pembayaran $0</>
              )}
              . Tombol pembayaran memakai mode preview (dummy).
            </p>
          )}
        </div>

        {/* Tombol bayar */}
        {!paid ? (
          canPayOnChain ? (
            <PayAdsButton
              campaignId={campaignId}
              amountUsd={priceUsd}
              onPaid={(tx) => onPaid?.(tx)}
              disabled={!!payDisabled} // ✅ kunci sampai form valid
              className={`mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 ${disabledCls}`}
            >
              Proceed to Payment
            </PayAdsButton>
          ) : (
            <button
              onClick={onOpenPayment}
              disabled={!!payDisabled}
              aria-disabled={!!payDisabled}
              className={`mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 ${disabledCls}`}
            >
              Proceed to Payment (Preview)
            </button>
          )
        ) : (
          <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
            Payment complete. You can now publish your ad.
          </div>
        )}
      </div>

      {/* Publish */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-neutral-200">Publish</h3>
        <p className="mt-2 text-xs text-neutral-500">
          Make sure all information looks correct.
        </p>
        <button
          onClick={onPublish}
          disabled={!readyToPublish}
          aria-disabled={!readyToPublish}
          className={`mt-3 inline-flex w-full items-center justify-center rounded-xl bg-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-600 ${disabledCls}`}
        >
          Publish Ad
        </button>
      </div>
    </aside>
  );
}
