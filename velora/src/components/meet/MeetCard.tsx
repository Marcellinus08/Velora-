"use client";

import React from "react";

type Kind = "voice" | "video";
export type MeetCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  tags?: string[]; // -> tidak dipakai untuk render
  pricing?: { voice?: number; video?: number }; // <- optional dan aman
};

export default function MeetCard({
  data,
  onCall,
  className = "",
}: {
  data: MeetCreator;
  onCall?: (creator: MeetCreator, kind: Kind) => void;
  className?: string;
}) {
  const { name, handle, avatarUrl } = data;

  // --- GUARD: jadikan objek kosong kalau tidak ada pricing
  const pricingObj = data.pricing ?? {};
  const voiceText =
    typeof pricingObj.voice === "number" ? `$${pricingObj.voice.toFixed(2)}/min` : "—";
  const videoText =
    typeof pricingObj.video === "number" ? `$${pricingObj.video.toFixed(2)}/min` : "—";

  return (
    <div className={`rounded-xl border border-neutral-800 bg-neutral-900 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="h-full w-full object-cover" src={avatarUrl} alt={name} />
          ) : (
            <div className="grid h-full w-full place-items-center text-neutral-400">👤</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-neutral-50">{name}</div>
          <div className="truncate text-sm text-neutral-400">@{handle}</div>
        </div>
      </div>

      {/* Tag chips DIHAPUS sesuai permintaan */}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <div className="text-xs text-neutral-400">Voice</div>
          <div className="text-sm font-semibold text-neutral-50">{voiceText}</div>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
          <div className="text-xs text-neutral-400">Video</div>
          <div className="text-sm font-semibold text-neutral-50">{videoText}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          className="flex-1 rounded-full bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          onClick={() => window.location.assign(`/user-profile/${data.id}`)}
        >
          View Profile
        </button>
        <button
          className="flex-1 rounded-full bg-[var(--primary-500)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          onClick={() => onCall?.(data, "voice")}
        >
          Call
        </button>
      </div>
    </div>
  );
}
