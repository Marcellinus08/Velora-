// src/components/studio/stats.tsx
"use client";

import { fmtInt, fmtUsd } from "@/lib/format";

type Totals = {
  videos: number;
  campaigns: number;
  /** Total unique buyers across all your paid videos */
  buyers: number;
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
                   left-1/2"
        style={{ insetInlineStart: "50%", translate: "-50% 0" } as React.CSSProperties}
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}

/** Material Icon (Round) kecil */
const MI = ({ name, className = "" }: { name: string; className?: string }) => (
  <span
    className={`material-icons-round text-neutral-500 text-[14px] leading-none align-middle ${className}`}
    aria-hidden="true"
  >
    {name}
  </span>
);

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
        rightIcon={<MI name="video_library" />}
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
        rightIcon={<MI name="campaign" />}
      />

      {/* Buyers (replaces Points) */}
      <StatCard
        label={
          <span className="inline-flex items-center">
            Buyers
            <InfoHint text="Total number of buyers across all your paid videos." />
          </span>
        }
        value={fmtInt(totals.buyers)}
        rightIcon={<MI name="shopping_bag" />}
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
        rightIcon={<MI name="paid" />}
      />
    </div>
  );
}
