// src/components/studio/actions.tsx
"use client";

import Link from "next/link";

export default function StudioActions() {
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
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 3a2 2 0 00-2 2v10l3-2 3 2 3-2 3 2V5a2 2 0 00-2-2H4z" />
            </svg>
          </div>
        </div>

        <Link
          href="/upload"
          prefetch={false}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90"
        >
          Go to Uploader
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 10h8l-3-3 1.4-1.4L17.8 12l-6.4 6.4L10 17l3-3H5v-4z" />
          </svg>
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
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3h14v2H3V3zm0 6h14v2H3V9zm0 6h14v2H3v-2z" />
            </svg>
          </div>
        </div>

        <Link
          href="/ads"
          prefetch={false}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-opacity-90"
        >
          New Campaign
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 10h8l-3-3 1.4-1.4L17.8 12l-6.4 6.4L10 17l3-3H5v-4z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
