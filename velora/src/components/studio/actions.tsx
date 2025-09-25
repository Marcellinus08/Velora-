// src/components/studio/actions.tsx
"use client";

import Link from "next/link";

export default function StudioActions() {
  // Helper Material Icon (Round)
  const MI = ({ name, className = "" }: { name: string; className?: string }) => (
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
            <h3 className="text-lg font-semibold text-neutral-50">Upload Video</h3>
            <p className="mt-1 text-sm text-neutral-300">
              Share your content with the community. MP4, WebM, MOV supported.
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800 p-2 text-neutral-300">
            <MI name="video_library" className="text-[18px] leading-none align-middle" />
          </div>
        </div>

        <Link
          href="/upload"
          prefetch={false}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90"
        >
          Go to Uploader
          <MI
            name="arrow_forward"
            className="text-[16px] leading-none align-middle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          />
        </Link>
      </div>

      {/* Create Ads */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-emerald-700/40 via-teal-600/25 to-cyan-600/20 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-50">Create Ads</h3>
            <p className="mt-1 text-sm text-neutral-300">
              Launch campaigns to promote videos and grow your audience.
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800 p-2 text-neutral-300">
            <MI name="ads_click" className="text-[18px] leading-none align-middle" />
          </div>
        </div>

        <Link
          href="/ads"
          prefetch={false}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90"
        >
          New Campaign
          <MI
            name="arrow_forward"
            className="text-[16px] leading-none align-middle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          />
        </Link>
      </div>
    </div>
  );
}
