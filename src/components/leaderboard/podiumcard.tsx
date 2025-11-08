"use client";

import React from "react";
import MI from "./MI";
import type { TopUser } from "./types";

export default function PodiumCard({
  user,
  highlight = false,
  borderClass = "border-neutral-700",
  onOpen,
}: {
  user: TopUser;
  highlight?: boolean;
  borderClass?: string;
  onOpen?: (u: { name: string; handle: string; rank?: number; score?: number; avatarUrl?: string }) => void;
}) {
  const ringClass = highlight ? "border-yellow-400" : borderClass;
  const badgeClass = highlight ? "border-yellow-400 text-yellow-400" : "border-neutral-700 text-yellow-400";
  const sizeClass = highlight ? "h-44 w-44" : "h-36 w-36";

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score, avatarUrl: user.avatarUrl });
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score, avatarUrl: user.avatarUrl })}
      onKeyDown={handleKey}
      className="relative flex w-full max-w-[14rem] flex-col items-center outline-none sm:max-w-[16rem] focus-visible:ring-2 focus-visible:ring-[var(--primary-500)] rounded-lg"
    >
      {highlight && (
        <div className="absolute -top-12 flex h-16 w-16 items-center justify-center text-yellow-400">
          <MI name="emoji_events" className="text-[18px]" />
        </div>
      )}

      <div
        className={`absolute -top-6 rounded-full border-4 ${badgeClass} bg-neutral-800 px-4 py-1.5 ${
          highlight ? "text-xl font-bold" : "text-lg font-bold"
        }`}
      >
        {user.rank}
      </div>

      {/* Avatar */}
      <div
        className={`mt-8 relative ${sizeClass} flex items-center justify-center overflow-hidden rounded-full border-4 ${ringClass} bg-neutral-700`}
      >
        {user.avatarNode}
      </div>

      <h3 className={`mt-4 ${highlight ? "text-2xl" : "text-xl"} font-bold text-neutral-50`}>{user.name}</h3>

      <div className="mt-2 flex items-center gap-1.5">
        <MI name="star" className={`${highlight ? "text-[18px]" : "text-[16px]"} text-yellow-400`} />
        <span className={`${highlight ? "text-xl" : "text-lg"} font-bold text-neutral-50`}>
          {Intl.NumberFormat("en-US").format(user.score)}
        </span>
      </div>
    </div>
  );
}
