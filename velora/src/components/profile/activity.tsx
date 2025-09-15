// src/components/profile/history.tsx
"use client";

import { useMemo, useState } from "react";
import type { HistoryItem } from "./types";

const kindIcon: Record<HistoryItem["kind"], JSX.Element> = {
  order: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a2 2 0 012-2h3l1 1h5a2 2 0 012 2v1H3V4zm0 3h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  watched: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 4.5c-4 0-7 4.5-7 5.5s3 5.5 7 5.5 7-4.5 7-5.5-3-5.5-7-5.5zm-1 3l4 2.5-4 2.5V7.5z" />
    </svg>
  ),
  quiz: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm1.07-5.75A2.5 2.5 0 0010 5a2.5 2.5 0 00-2.22 1.32 1 1 0 11-1.76-.96A4.5 4.5 0 0110 3a4.5 4.5 0 014.28 3.22c.2.63-.28 1.28-.94 1.28H12a1 1 0 000 2h.5a1.5 1.5 0 010 3H11v-1.2a2.3 2.3 0 00.8-3.5l-.73-.55z" />
    </svg>
  ),
  reward: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2l2.39 4.84L18 8l-4 3.9L15.27 18 10 14.9 4.73 18 6 11.9 2 8l5.61-1.16L10 2z" />
    </svg>
  ),
};

type Filter = "all" | HistoryItem["kind"];

export default function ProfileHistory({ items = [] }: { items?: HistoryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.kind === filter);
  }, [filter, items]);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">History</h2>
        <div className="flex flex-wrap gap-2">
          {(["all", "order", "watched", "quiz", "reward"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === k
                  ? "bg-[var(--primary-500)] text-white"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              {k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        {filtered.length === 0 ? (
          <p className="text-neutral-400">No history yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {filtered.map((h) => (
              <li key={h.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 text-neutral-300">{kindIcon[h.kind]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-neutral-200">{h.title}</p>
                  <p className="text-sm text-neutral-500">
                    {h.time}
                    {h.meta ? ` • ${h.meta}` : ""}
                  </p>
                </div>
                {h.amount ? (
                  <span className="shrink-0 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-100">
                    {h.amount}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
