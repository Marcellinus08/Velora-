// src/components/studio/stats.tsx
"use client";

import { fmtInt, fmtUsd } from "@/lib/format";

type Totals = {
  videos: number;
  campaigns: number;
  points: number;
  /** Earnings from paid video purchases (USD) */
  earningsUsd: number;
};

/** CSS-only tooltip with clamped width and safe insets */
function InfoHint({ text }: { text: string }) {
  return (
    <span className="relative ml-2 inline-flex group align-middle">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 text-[10px] leading-none text-neutral-300
                   hover:border-neutral-500 hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-500)]"
        aria-label="Info"
        tabIndex={0}
      >
        i
      </span>
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute top-full z-20 mt-2 hidden max-w-[420px] -translate-x-1/2 rounded-lg border border-neutral-800
                   bg-neutral-900/90 px-3 py-2 text-xs text-neutral-200 shadow-lg backdrop-blur
                   group-hover:block group-focus-within:block
                   left-1/2 ltr:[--pad:16px] rtl:[--pad:16px] 
                   [--gutter:16px] 
                   [transform-origin:top_center]"
        style={{
          // Pastikan tidak nabrak sisi kiri/kanan container outer
          insetInlineStart: "50%",
          translate: "-50% 0",
        } as React.CSSProperties}
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}

function StatCard({
  label,
  value,
  rightIcon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{label}</p>
        {rightIcon ?? null}
      </div>
      <p className="mt-2 text-lg font-semibold text-neutral-50">{value}</p>
    </div>
  );
}

export default function StudioStats({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Videos */}
      <StatCard
        label={
          <span className="inline-flex items-center">
            Videos
            <InfoHint text="Total videos in your studio (Published, Unlisted, or Draft)." />
          </span>
        }
        value={fmtInt(totals.videos)}
        rightIcon={
          <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4 4h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm12 3l3-2v10l-3-2V7z" />
          </svg>
        }
      />

      {/* Campaigns */}
      <StatCard
        label={
          <span className="inline-flex items-center">
            Campaigns
            <InfoHint text="Number of ad campaigns you created to promote your content (Running / Paused / Ended)." />
          </span>
        }
        value={fmtInt(totals.campaigns)}
        rightIcon={
          <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 4h14v2H3V4zm0 5h10v2H3V9zm0 5h14v2H3v-2z" />
          </svg>
        }
      />

      {/* Points */}
      <StatCard
        label={
          <span className="inline-flex items-center">
            Points
            <InfoHint text="Total points earned from your uploaded videos. Points are awarded based on your content activity (e.g., uploads, views, or milestones)." />
          </span>
        }
        value={fmtInt(totals.points)}
        rightIcon={
          <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2l2.39 4.84L18 8l-4 3.89L15.18 18 10 15.27 4.82 18 6 11.89 2 8l5.61-1.16L10 2z" />
          </svg>
        }
      />

      {/* Earnings */}
      <StatCard
        label={
          <span className="inline-flex items-center">
            Earnings
            <InfoHint text="Earnings from viewers who purchased your videos (settled sales). Withdrawable according to the payout policy." />
          </span>
        }
        value={fmtUsd(totals.earningsUsd)}
        rightIcon={
          <svg className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4 10a6 6 0 1112 0A6 6 0 014 10zm7-3H9a2 2 0 100 4h2a2 2 0 110 4H9" />
          </svg>
        }
      />
    </div>
  );
}
