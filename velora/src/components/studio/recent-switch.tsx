"use client";

import { useMemo, useState } from "react";
import StudioRecentUploads from "./recent-uploads";
import StudioRecentAds from "./recent-ads";
import type { StudioAd, StudioVideo } from "./types";

export default function StudioRecentSwitch({
  uploads = [],
  ads = [],
  showCount = 3,
}: {
  uploads?: StudioVideo[];
  ads?: StudioAd[];
  showCount?: number;
}) {
  const [tab, setTab] = useState<"uploads" | "ads">("uploads");
  const [expanded, setExpanded] = useState(false);

  // item yang terlihat pada tab aktif (untuk label "View all" yang terasa benar)
  const visibleCount = useMemo(() => {
    const arr = tab === "uploads" ? uploads : ads;
    return expanded ? arr.length : Math.min(arr.length, showCount);
  }, [tab, uploads, ads, expanded, showCount]);

  return (
    <section>
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-neutral-50">Recent</h2>

          <div className="flex items-center gap-2">
            {/* Segmented tabs */}
            <div
              role="tablist"
              aria-label="Recent content switch"
              className="inline-flex rounded-full border border-neutral-800 bg-neutral-900/60 p-1"
            >
              <button
                role="tab"
                aria-selected={tab === "uploads"}
                onClick={() => {
                  setTab("uploads");
                  setExpanded(false); // reset saat ganti tab agar konsisten
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  tab === "uploads"
                    ? "bg-[var(--primary-500)] text-white shadow"
                    : "text-neutral-200 hover:text-white"
                }`}
              >
                Uploads
              </button>
              <button
                role="tab"
                aria-selected={tab === "ads"}
                onClick={() => {
                  setTab("ads");
                  setExpanded(false);
                }}
                className={`ml-1 rounded-full px-3 py-1.5 text-sm transition ${
                  tab === "ads"
                    ? "bg-[var(--primary-500)] text-white shadow"
                    : "text-neutral-200 hover:text-white"
                }`}
              >
                Ads
              </button>
            </div>

            {/* View all / Show less */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-500)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-opacity-90"
              title={expanded ? "Collapse list" : "Show all items"}
            >
              {expanded ? "Show less" : "View all"}
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 10h8l-3-3 1.4-1.4L17.8 12l-6.4 6.4L10 17l3-3H5v-4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info kecil jumlah item terlihat (opsional) */}
        <p className="mt-1 text-xs text-neutral-400">
          Showing {visibleCount} {tab === "uploads" ? "upload" : "campaign"}
          {visibleCount === 1 ? "" : "s"}
        </p>
      </div>

      {/* Panel */}
      {tab === "uploads" ? (
        <StudioRecentUploads items={uploads} showCount={showCount} expanded={expanded} />
      ) : (
        <StudioRecentAds items={ads} showCount={showCount} expanded={expanded} />
      )}
    </section>
  );
}
