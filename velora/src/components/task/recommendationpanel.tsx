// src/components/task/recommendationpanel.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RecommendedVideo } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RecommendationItem({ video }: { video: RecommendedVideo }) {
  return (
    <a
      href={`/task?id=${video.id}`}
      className="flex items-start gap-3 rounded-lg p-2 hover:bg-neutral-800/70"
    >
      <div className="relative aspect-video h-auto w-28 shrink-0 overflow-hidden rounded">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p
          className="truncate text-sm font-semibold text-neutral-50"
          title={video.title}
        >
          {video.title}
        </p>
        <p className="truncate text-xs text-neutral-400">{video.creator}</p>
      </div>
    </a>
  );
}

export default function RecommendationPanel({
  items,
}: {
  items: RecommendedVideo[];
}) {
  // Penting: pilih 3 item secara acak HANYA ketika 'items' berubah (mis. saat buka video lain).
  const selected = useMemo(() => {
    if (!items || items.length === 0) return [];
    return items.length <= 3 ? items : shuffle(items).slice(0, 3);
  }, [items]);

  if (!selected.length) return null;

  return (
    <div>
      <h3 className="mb-2 px-2 text-base font-semibold text-neutral-200">
        Recommended for you
      </h3>
      <div className="space-y-1">
        {selected.map((video) => (
          <RecommendationItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
