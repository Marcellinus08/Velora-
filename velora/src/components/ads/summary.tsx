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
  saving = false, // NEW: status saving to database
  userActiveCampaign, // NEW: user active campaign info
}: SummaryProps) {
  const canPayOnChain = Boolean(TREASURY_ADDRESS) && priceUsd > 0;

  // util untuk kelas disabled yang konsisten
  const disabledCls =
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

  return (
    <aside className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-3xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Payment Summary</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-neutral-300 text-sm">Campaign Duration</span>
            </div>
            <span className="text-neutral-100 font-medium">
              {durationDays} {durationDays > 1 ? "days" : "day"}
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />

          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-emerald-200 font-medium">Total Amount</span>
            </div>
            <span className="text-emerald-100 text-xl font-bold">{fmtUSD(priceUsd)}</span>
          </div>

          {/* User Active Campaign Warning (Small) - Below Total Amount */}
          {userActiveCampaign?.hasActiveCampaign && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-red-300 mb-1">You Already Have an Active Campaign</p>
                  <p className="text-red-200/80">
                    <strong>{userActiveCampaign.activeCampaign?.title}</strong>
                  </p>
                  <p className="text-red-200/70 mt-1">
                    Ends: {new Date(userActiveCampaign.activeCampaign?.end_date || '').toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

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

        {/* Tombol Pay & Publish (digabung) */}
        {canPayOnChain ? (
          <PayAdsButton
            campaignId={campaignId}
            amountUsd={priceUsd}
            onPaid={(tx) => {
              onPaid?.(tx);
            }}
            disabled={!!payDisabled || saving}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/20 transition-all duration-200 transform hover:scale-105 ${disabledCls}`}
          >
            <div className="flex items-center gap-3">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay & Publish Ad
                </>
              )}
            </div>
          </PayAdsButton>
        ) : (
          <button
            onClick={() => {
              onOpenPayment();
            }}
            disabled={!!payDisabled || saving}
            aria-disabled={!!payDisabled || saving}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 hover:from-purple-700 hover:via-purple-600 hover:to-fuchsia-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-purple-500/20 transition-all duration-200 transform hover:scale-105 cursor-pointer ${disabledCls}`}
          >
            <div className="flex items-center gap-3">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Pay & Publish Ad (Preview)
                </>
              )}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
