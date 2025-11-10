// src/components/studio/stats.tsx
"use client";

import { fmtInt, fmtUsd } from "@/lib/format";

type Totals = {
  videos: number;
  campaigns: number;
  /** Total completed meets */
  meets: number;
  /** Earnings from video sales and meet bookings (USD) */
  earningsUsd: number;
};

/** CSS-only tooltip with clamped width and safe insets */
function InfoHint({ text }: { text: string }) {
  return (
    <span className="relative ml-2 inline-flex group/tooltip align-middle isolate">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 text-[10px] leading-none text-neutral-300
                   hover:border-neutral-500 hover:text-neutral-100 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all duration-200 cursor-help"
        aria-label="Info"
        tabIndex={0}
      >
        i
      </span>
      {/* Tooltip - positioned to the right with max-width constraint */}
      <span
        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 z-50 ml-2 hidden max-w-[200px] rounded-lg border border-neutral-800
                   bg-neutral-900/95 px-3 py-2 text-xs text-neutral-200 shadow-xl backdrop-blur-md
                   group-hover/tooltip:block group-focus-within/tooltip:block whitespace-normal break-words"
        role="tooltip"
      >
        {text}
        {/* Arrow pointing to the icon */}
        <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-px">
          <span className="block w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-neutral-800"></span>
        </span>
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
  gradient,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div className="group relative rounded-2xl max-sm:rounded-lg border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-sm p-5 max-sm:p-3 transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-1">
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 rounded-2xl max-sm:rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient || 'bg-gradient-to-br from-purple-600/5 via-blue-600/5 to-pink-600/5'}`} />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm max-sm:text-xs font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">
            {label}
          </p>
          <div className="text-neutral-500 group-hover:text-purple-400 transition-colors max-sm:scale-90">
            {rightIcon ?? null}
          </div>
        </div>
        <p className="mt-3 max-sm:mt-2 text-2xl max-sm:text-lg font-bold bg-gradient-to-br from-neutral-50 to-neutral-300 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all">
          {value}
        </p>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/50 transition-all duration-300 rounded-b-2xl max-sm:rounded-b-lg" />
    </div>
  );
}

export default function StudioStats({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-1 gap-4 max-sm:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {/* Videos */}
      <StatCard
        label={
          <span className="inline-flex items-center max-sm:text-[11px]">
            Videos
            <InfoHint text="Total videos in your studio (Published, Unlisted, or Draft)." />
          </span>
        }
        value={fmtInt(totals.videos)}
        rightIcon={<MI name="video_library" />}
        gradient="bg-gradient-to-br from-purple-600/5 via-violet-600/5 to-fuchsia-600/5"
      />

      {/* Campaigns */}
      <StatCard
        label={
          <span className="inline-flex items-center max-sm:text-[11px]">
            Campaigns
            <InfoHint text="Number of ad campaigns you created to promote your content (Running / Paused / Ended)." />
          </span>
        }
        value={fmtInt(totals.campaigns)}
        rightIcon={<MI name="campaign" />}
        gradient="bg-gradient-to-br from-blue-600/5 via-cyan-600/5 to-teal-600/5"
      />

      {/* Meets (replaces Buyers) - COMING SOON */}
      {/* <StatCard
        label={
          <span className="inline-flex items-center max-sm:text-[11px]">
            Meets
            <InfoHint text="Total number of completed meet bookings with participants." />
          </span>
        }
        value={fmtInt(totals.meets)}
        rightIcon={<MI name="video_call" />}
        gradient="bg-gradient-to-br from-pink-600/5 via-rose-600/5 to-red-600/5"
      /> */}

      {/* Earnings */}
      <StatCard
        label={
          <span className="inline-flex items-center max-sm:text-[11px]">
            Earnings
            <InfoHint text="Earnings from video sales (60%) and meet bookings (80%). Withdrawable according to the payout policy." />
          </span>
        }
        value={fmtUsd(totals.earningsUsd)}
        rightIcon={<MI name="paid" />}
        gradient="bg-gradient-to-br from-emerald-600/5 via-green-600/5 to-lime-600/5"
      />
    </div>
  );
}
