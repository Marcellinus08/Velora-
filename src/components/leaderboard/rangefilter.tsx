"use client";

import type { RangeKey } from "./types";

export default function RangeFilter({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
  const items: { key: RangeKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "all", label: "All-time" },
  ];
  return (
    <div className="inline-flex rounded-full border border-neutral-700 bg-neutral-900">
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              active ? "bg-[var(--primary-500)] text-white" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
