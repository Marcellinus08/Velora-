"use client";

import React from "react";
import MeetCard, { MeetCreator } from "./MeetCard";

// Normalisasi ke bentuk MeetCreator (selalu ada pricing object)
function toCreator(x: any): MeetCreator {
  return {
    id: String(x?.id ?? ""),
    name: String(x?.name ?? "Unknown"),
    handle: String(x?.handle ?? "unknown"),
    avatarUrl: x?.avatarUrl ?? null,
    pricing: {
      voice:
        x?.pricing?.voice ??
        x?.voicePerMinute ??
        (typeof x?.voice === "number" ? x.voice : undefined),
      video:
        x?.pricing?.video ??
        x?.videoPerMinute ??
        (typeof x?.video === "number" ? x.video : undefined),
    },
  };
}

export default function AvailableRow() {
  const [creators, setCreators] = React.useState<MeetCreator[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/meet/discover", { cache: "no-store" });
        const raw = (await res.json()) as any[];
        const norm = (raw || []).map(toCreator).slice(0, 4);
        if (alive) setCreators(norm);
      } catch {
        if (alive) setCreators([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading || creators.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-50">Meet now</h3>
        <button
          className="text-sm font-medium text-[var(--primary-500)] hover:opacity-90"
          onClick={() => window.location.assign("/meet")}
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {creators.map((c) => (
          <MeetCard
            key={c.id}
            data={c}
            onCall={(creator, kind) => {
              const qs = new URLSearchParams({ creator: creator.id, kind });
              window.location.assign(`/meet?${qs.toString()}`);
            }}
          />
        ))}
      </div>
    </section>
  );
}
