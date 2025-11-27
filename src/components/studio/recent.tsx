"use client";

import { useState } from "react";
import type { StudioVideo, StudioAd, StudioMeet } from "./types";
import StudioRecentUploads from "./recent-uploads";
import StudioRecentAds from "./recent-ads";
import StudioRecentMeets from "./recent-meets";

export default function StudioRecentPanel({
  videos = [],
  ads = [],
  meets = [],
  onAdsUpdate,
}: {
  videos?: StudioVideo[];
  ads?: StudioAd[];
  meets?: StudioMeet[];
  onAdsUpdate?: () => void;
}) {
  const [tab, setTab] = useState<"uploads" | "ads" | "meets">("uploads");
  const [expanded, setExpanded] = useState(false);

  // jumlah item yg ditampilkan
  const showCount = expanded ? Number.MAX_SAFE_INTEGER : 3;

  return (
    <section className="rounded-2xl max-sm:rounded-lg border border-neutral-800 bg-neutral-900/60">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 max-sm:gap-2 border-b border-neutral-800 p-4 max-sm:p-3">
        <div className="flex items-center gap-3 max-sm:gap-2 max-sm:flex-col max-sm:w-full max-sm:items-start">
          <h2 className="text-xl max-sm:text-lg font-semibold text-neutral-50">Recent</h2>

          {/* Tabs */}
          <div className="flex rounded-lg bg-neutral-800 p-1 max-sm:w-full max-sm:justify-between">
            <button
              onClick={() => setTab("uploads")}
              className={`rounded-md px-3 py-1 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs transition-colors cursor-pointer max-sm:flex-1 ${
                tab === "uploads"
                  ? "bg-neutral-700 text-neutral-50"
                  : "text-neutral-300 hover:text-neutral-100"
              }`}
              aria-pressed={tab === "uploads"}
            >
              Uploads
            </button>
            <button
              onClick={() => setTab("ads")}
              className={`rounded-md px-3 py-1 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs transition-colors cursor-pointer max-sm:flex-1 ${
                tab === "ads"
                  ? "bg-neutral-700 text-neutral-50"
                  : "text-neutral-300 hover:text-neutral-100"
              }`}
              aria-pressed={tab === "ads"}
            >
              Ads
            </button>
            {/* Meets Tab - COMING SOON */}
            {/* <button
              onClick={() => setTab("meets")}
              className={`rounded-md px-3 py-1 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs transition-colors cursor-pointer max-sm:flex-1 ${
                tab === "meets"
                  ? "bg-neutral-700 text-neutral-50"
                  : "text-neutral-300 hover:text-neutral-100"
              }`}
              aria-pressed={tab === "meets"}
            >
              Meets
            </button> */}
          </div>
        </div>

        {/* View all / Show less */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full bg-[var(--primary-500)] px-3 py-1.5 max-sm:px-4 max-sm:py-2 text-sm max-sm:text-base font-semibold text-white transition hover:bg-opacity-90 cursor-pointer max-sm:w-full"
        >
          {expanded ? "Show less" : "View all"}
        </button>
      </header>

      {/* Body */}
      <div className="p-4 max-sm:p-3">
        {tab === "uploads" ? (
          <StudioRecentUploads items={videos} showCount={showCount} />
        ) : tab === "ads" ? (
          <StudioRecentAds items={ads} showCount={showCount} onStatusChange={onAdsUpdate} />
        ) : null}
        {/* Meets content - COMING SOON */}
        {/* : (
          <StudioRecentMeets items={meets} showCount={showCount} />
        )} */}
      </div>
    </section>
  );
}
