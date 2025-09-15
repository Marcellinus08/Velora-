"use client";

import type { StudioAd } from "./types";

export default function StudioRecentAds({
  items = [],
  showCount = 3,
}: {
  items?: StudioAd[];
  showCount?: number;
}) {
  return (
    <section>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40">
        {items.length === 0 ? (
          <div className="p-6 text-neutral-400">No campaigns yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {items.slice(0, showCount).map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-5 items-center gap-3 p-3 text-sm"
              >
                <div className="col-span-2 min-w-0">
                  <p className="truncate text-neutral-50">{a.name}</p>
                  <p className="text-xs text-neutral-400">{a.date}</p>
                </div>
                <div className="text-neutral-200">{a.budget}</div>
                <div className="text-neutral-200">{a.spend}</div>
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">
                    {a.ctr}% CTR
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      a.status === "Active"
                        ? "bg-emerald-900/30 text-emerald-300"
                        : a.status === "Paused"
                        ? "bg-neutral-800 text-neutral-300"
                        : "bg-red-900/30 text-red-300"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
