"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { RecommendedVideo } from "./types";
import { LockOverlay } from "./LockOverlay";
import Link from "next/link";

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
    <Link
      href={`/video?id=${video.id}`}
      className="group relative flex items-start gap-3 rounded-lg p-2 hover:bg-neutral-800/70 transition-colors"
    >
      <div className="relative aspect-video h-auto w-28 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="112px"
          className={`object-cover transition-transform duration-300 ${video.isLocked ? 'opacity-80' : 'group-hover:scale-110'}`}
        />
        {video.isLocked && <LockOverlay price={video.price} />}
      </div>
      <div className="min-w-0 flex-1">
        {/* Title */}
        <p
          className={`truncate text-sm font-semibold ${
            video.isLocked 
              ? 'text-neutral-400 group-hover:text-neutral-200' 
              : 'text-neutral-50 group-hover:text-[var(--primary-500)]'
          } transition-colors`}
          title={video.title}
        >
          {video.title}
        </p>

        {/* Creator info */}
        <p className="mt-0.5 truncate text-[11px] text-neutral-500/80">
          {video.creator.name || 
           (video.creator.wallet ? shortenWalletAddress(video.creator.wallet.toLowerCase()) : "Anonymous")}
        </p>

        {/* Points and unlock info */}
        <div className="mt-1.5 flex items-center gap-2">
          {typeof video.points === 'number' && video.points > 0 && (
            <span className="inline-flex items-center gap-1 text-yellow-400">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] font-medium">{video.points}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RecommendationPanel({
  items,
}: {
  items: RecommendedVideo[];
}) {
  // Penting: pilih 3 item secara acak HANYA ketika 'items' berubah
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