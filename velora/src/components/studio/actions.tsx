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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Upload Video */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-violet-700/40 via-violet-600/25 to-fuchsia-600/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-50">
              Upload Video
            </h3>
            <p className="mt-1 text-sm text-neutral-300">
              Share your content with the community. MP4, WebM, MOV supported.
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800 p-2 text-neutral-300">
            <MI
              name="video_library"
              className="text-[18px] leading-none align-middle"
            />
          </div>
        </div>

        <Link
          href="/upload"
          prefetch={false}
          className={[
            "place-self-start justify-self-start w-auto",
            "group relative inline-flex items-center gap-2 mt-4",
            "rounded-full px-4 py-2 text-sm font-semibold text-white",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
            "hover:-translate-y-0.5 active:translate-y-0",
            "bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90",
            "hover:shadow-[0_12px_24px_-6px_rgba(168,85,247,0.45)]",
            "before:content-[''] before:absolute before:inset-0 before:rounded-full",
            "before:opacity-0 before:transition-opacity before:duration-200",
            "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.25),transparent)] group-hover:before:opacity-100",
          ].join(" ")}
        >
          {/* shimmer sweep (tidak mempengaruhi layout) */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/20 opacity-0 transition-all duration-300 group-hover:left-[110%] group-hover:opacity-100" />
          </span>

          <span>Go to Uploader</span>
          <MI
            name="arrow_forward"
            className="shrink-0 text-[16px] leading-none align-middle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          />
        </Link>
      </div>

      {/* Create Ads */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-emerald-700/40 via-teal-600/25 to-cyan-600/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-50">
              Create Ads
            </h3>
            <p className="mt-1 text-sm text-neutral-300">
              Launch campaigns to promote videos and grow your audience.
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800 p-2 text-neutral-300">
            <MI
              name="ads_click"
              className="text-[18px] leading-none align-middle"
            />
          </div>
        </div>

        <Link
          href="/ads"
          prefetch={false}
          className={[
            // cegah melar di grid/flex container
            "place-self-start justify-self-start w-auto",

            // tombol + efek (sama seperti yang sebelumnya)
            "group relative inline-flex items-center gap-2 mt-4",
            "rounded-full px-4 py-2 text-sm font-semibold text-white",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "focus-visible:ring-[var(--primary-500)] focus-visible:ring-offset-neutral-900",
            "hover:-translate-y-0.5 active:translate-y-0",
            "bg-[var(--primary-500)] hover:bg-[var(--primary-500)]/90",
            "hover:shadow-[0_12px_24px_-6px_rgba(168,85,247,0.45)]",
            "before:content-[''] before:absolute before:inset-0 before:rounded-full",
            "before:opacity-0 before:transition-opacity before:duration-200",
            "before:bg-[radial-gradient(120px_80px_at_10%_10%,rgba(255,255,255,0.25),transparent)] group-hover:before:opacity-100",
          ].join(" ")}
        >
          {/* shimmer sweep */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute -left-10 top-0 h-full w-8 skew-x-[-20deg] bg-white/20 opacity-0 transition-all duration-300 group-hover:left-[110%] group-hover:opacity-100" />
          </span>

          <span>New Campaign</span>
          <MI
            name="arrow_forward"
            className="shrink-0 text-[16px] leading-none align-middle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          />
        </Link>
      </div>
    </div>
  );
}
