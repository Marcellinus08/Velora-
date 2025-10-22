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

// Helper untuk mempersingkat alamat wallet
function shortenWalletAddress(address: string): string {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold text-neutral-50"
          title={video.title}
        >
          {video.title}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {video.creator.name || 
           (video.creator.wallet ? shortenWalletAddress(video.creator.wallet.toLowerCase()) : "Anonymous")}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {typeof video.points === 'number' && video.points > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-300">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.464 3.314a.75.75 0 00-1.1.16L6.25 8H2.5A.75.75 0 001.75 8.75v2.5A.75.75 0 002.5 12h2.75l2.114 3.525a.75.75 0 001.1.16l2.886-2.163a.75.75 0 00.3-.6V6.178a.75.75 0 00-.3-.6l-2.886-2.163z" />
              </svg>
              {video.points} pts
            </span>
          )}
          {video.price && (
            <span className="inline-flex items-center rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
              {video.price.amount} {video.price.currency}
            </span>
          )}
        </div>
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
