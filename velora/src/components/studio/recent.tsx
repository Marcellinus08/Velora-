"use client";

import { useState } from "react";
import type { StudioVideo, StudioAd } from "./types";
import StudioRecentUploads from "./recent-uploads";
import StudioRecentAds from "./recent-ads";

export default function StudioRecentPanel({
  videos = [],
  ads = [],
}: {
  videos?: StudioVideo[];
  ads?: StudioAd[];
}) {
  const [tab, setTab] = useState<"uploads" | "ads">("uploads");
  const [expanded, setExpanded] = useState(false);

  // jumlah item yg ditampilkan
  const showCount = expanded ? Number.MAX_SAFE_INTEGER : 3;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-neutral-50">Recent</h2>

          {/* Tabs */}
          <div className="flex rounded-lg bg-neutral-800 p-1">
            <button
              onClick={() => setTab("uploads")}
              className={`rounded-md px-3 py-1 text-sm transition-colors cursor-pointer ${
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
              className={`rounded-md px-3 py-1 text-sm transition-colors cursor-pointer ${
                tab === "ads"
                  ? "bg-neutral-700 text-neutral-50"
                  : "text-neutral-300 hover:text-neutral-100"
              }`}
              aria-pressed={tab === "ads"}
            >
              Ads
            </button>
          </div>
        </div>

        {/* View all / Show less */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full bg-[var(--primary-500)] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-opacity-90 cursor-pointer"
        >
          {expanded ? "Show less" : "View all"}
        </button>
      </header>

      {/* Body */}
      <div className="p-4">
        {tab === "uploads" ? (
          <StudioRecentUploads items={videos} showCount={showCount} />
        ) : (
          <StudioRecentAds items={ads} showCount={showCount} />
        )}
      </div>
    </section>
  );
}
