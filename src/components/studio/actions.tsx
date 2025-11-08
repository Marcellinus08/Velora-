// src/components/studio/actions.tsx
"use client";

import Link from "next/link";

export default function StudioActions() {
  // Helper Material Icon (Round)
  const MI = ({
    name,
    className = "",
  }: {
    name: string;
    className?: string;
  }) => (
    <span className={`material-icons-round ${className}`} aria-hidden="true">
      {name}
    </span>
  );

  return (
    <div className="grid grid-cols-1 gap-6 max-sm:gap-4 lg:grid-cols-2">
      {/* Upload Video */}
      <div className="group relative rounded-2xl max-sm:rounded-lg border border-violet-700/30 bg-gradient-to-br from-violet-700/40 via-violet-600/25 to-fuchsia-600/20 p-6 max-sm:p-4 backdrop-blur-sm transition-all duration-300 hover:border-violet-600/50 hover:shadow-xl hover:shadow-violet-900/20 hover:-translate-y-1">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 rounded-2xl max-sm:rounded-lg bg-gradient-to-br from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 opacity-0 group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-fuchsia-500/10 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg max-sm:text-base font-bold text-neutral-50 group-hover:text-white transition-colors">
                Upload Video
              </h3>
              <p className="mt-2 max-sm:mt-1 text-sm max-sm:text-xs text-neutral-300 group-hover:text-neutral-200 transition-colors">
                Share your content with the community. MP4, WebM, MOV supported.
              </p>
            </div>
            <div className="rounded-xl bg-neutral-800/60 backdrop-blur-sm p-2.5 max-sm:p-2 text-violet-300 group-hover:bg-violet-600/30 group-hover:text-violet-200 transition-all duration-300 group-hover:scale-110">
              <MI
                name="video_library"
                className="text-[20px] max-sm:text-[18px] leading-none align-middle"
              />
            </div>
          </div>

          <Link
            href="/upload"
            prefetch={false}
            className={[
              "place-self-start justify-self-start w-auto max-sm:w-full max-sm:justify-center",
              "group/btn relative inline-flex items-center gap-2 mt-5 max-sm:mt-3",
              "rounded-full px-5 py-2.5 max-sm:px-4 max-sm:py-2 text-sm max-sm:text-xs font-semibold text-white",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-violet-500 focus-visible:ring-offset-neutral-900",
              "hover:-translate-y-0.5 active:translate-y-0",
              "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500",
              "hover:shadow-[0_12px_24px_-6px_rgba(139,92,246,0.5)]",
              "before:content-[''] before:absolute before:inset-0 before:rounded-full",
              "before:opacity-0 before:transition-opacity before:duration-200",
              "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.3),transparent)] hover:before:opacity-100",
            ].join(" ")}
          >
            {/* shimmer sweep */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/30 opacity-0 transition-all duration-300 group-hover/btn:left-[110%] group-hover/btn:opacity-100" />
            </span>

            <span>Go to Uploader</span>
            <MI
              name="arrow_forward"
              className="shrink-0 text-[16px] max-sm:text-[14px] leading-none align-middle transition-transform duration-200 group-hover/btn:translate-x-1 group-hover/btn:scale-110"
            />
          </Link>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500/0 to-transparent group-hover:via-violet-500/60 transition-all duration-500 rounded-b-2xl max-sm:rounded-b-lg blur-sm" />
      </div>

      {/* Create Ads */}
      <div className="group relative rounded-2xl max-sm:rounded-lg border border-emerald-700/30 bg-gradient-to-br from-emerald-700/40 via-teal-600/25 to-cyan-600/20 p-6 max-sm:p-4 backdrop-blur-sm transition-all duration-300 hover:border-emerald-600/50 hover:shadow-xl hover:shadow-emerald-900/20 hover:-translate-y-1">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 rounded-2xl max-sm:rounded-lg bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-cyan-500/0 opacity-0 group-hover:from-emerald-500/10 group-hover:via-teal-500/5 group-hover:to-cyan-500/10 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg max-sm:text-base font-bold text-neutral-50 group-hover:text-white transition-colors">
                Create Ads
              </h3>
              <p className="mt-2 max-sm:mt-1 text-sm max-sm:text-xs text-neutral-300 group-hover:text-neutral-200 transition-colors">
                Launch campaigns to promote videos and grow your audience.
              </p>
            </div>
            <div className="rounded-xl bg-neutral-800/60 backdrop-blur-sm p-2.5 max-sm:p-2 text-emerald-300 group-hover:bg-emerald-600/30 group-hover:text-emerald-200 transition-all duration-300 group-hover:scale-110">
              <MI
                name="ads_click"
                className="text-[20px] max-sm:text-[18px] leading-none align-middle"
              />
            </div>
          </div>

          <Link
            href="/ads"
            prefetch={false}
            className={[
              "place-self-start justify-self-start w-auto max-sm:w-full max-sm:justify-center",
              "group/btn relative inline-flex items-center gap-2 mt-5 max-sm:mt-3",
              "rounded-full px-5 py-2.5 max-sm:px-4 max-sm:py-2 text-sm max-sm:text-xs font-semibold text-white",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-emerald-500 focus-visible:ring-offset-neutral-900",
              "hover:-translate-y-0.5 active:translate-y-0",
              "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
              "hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.5)]",
              "before:content-[''] before:absolute before:inset-0 before:rounded-full",
              "before:opacity-0 before:transition-opacity before:duration-200",
              "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.3),transparent)] hover:before:opacity-100",
            ].join(" ")}
          >
            {/* shimmer sweep */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/30 opacity-0 transition-all duration-300 group-hover/btn:left-[110%] group-hover/btn:opacity-100" />
            </span>

            <span>New Campaign</span>
            <MI
              name="arrow_forward"
              className="shrink-0 text-[16px] max-sm:text-[14px] leading-none align-middle transition-transform duration-200 group-hover/btn:translate-x-1 group-hover/btn:scale-110"
            />
          </Link>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/60 transition-all duration-500 rounded-b-2xl max-sm:rounded-b-lg blur-sm" />
      </div>
    </div>
  );
}
