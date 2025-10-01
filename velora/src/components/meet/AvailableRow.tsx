"use client";

import React from "react";
import MeetCard, { MeetCreator } from "./MeetCard";

export default function AvailableRow() {
  const [creators, setCreators] = React.useState<MeetCreator[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/meet/discover", { cache: "no-store" });
        const json = (await res.json()) as MeetCreator[];
        if (alive) setCreators(json.slice(0, 4));
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
              // For now just go to Meet hub and preselect creator
              const qs = new URLSearchParams({ creator: creator.id, kind });
              window.location.assign(`/meet?${qs.toString()}`);
            }}
          />
        ))}
      </div>
    </section>
  );
}
