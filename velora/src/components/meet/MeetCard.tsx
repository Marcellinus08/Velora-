import React from "react";

type Creator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: { voice?: number; video?: number }; // USD per minute
};

export const MeetCard = ({ creator, onCall }: { creator: Creator; onCall: (c: Creator) => void }) => {
  const voice = typeof creator.pricing?.voice === "number" ? creator.pricing.voice : undefined;
  const video = typeof creator.pricing?.video === "number" ? creator.pricing.video : undefined;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-all hover:border-[var(--primary-500)] hover:bg-neutral-900/80 hover:shadow-[0_0_0_1px_var(--primary-500),0_0_24px_2px_rgba(139,92,246,0.45)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
          {creator.avatarUrl ? (
            <img className="h-full w-full object-cover" src={creator.avatarUrl} alt={creator.name} />
          ) : (
            <div className="grid h-full w-full place-items-center text-neutral-400">👤</div>
          )}
        </div>
        <div>
          <div className="text-base font-semibold text-neutral-50">{creator.name}</div>
          <div className="text-xs text-neutral-400">@{creator.handle}</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-800 p-3 transition-colors hover:border-neutral-700">
          <div className="text-xs uppercase tracking-wide text-neutral-400">Voice</div>
          <div className="text-sm font-semibold text-neutral-100">
            {typeof voice === "number" ? `$${voice.toFixed(2)}/min` : "N/A"}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3 transition-colors hover:border-neutral-700">
          <div className="text-xs uppercase tracking-wide text-neutral-400">Video</div>
          <div className="text-sm font-semibold text-neutral-100">
            {typeof video === "number" ? `$${video.toFixed(2)}/min` : "N/A"}
          </div>
        </div>
      </div>

      <button
        className="w-full rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        onClick={() => onCall(creator)}
        disabled={voice === undefined && video === undefined}
        title={voice === undefined && video === undefined ? "Creator belum set rate" : ""}
      >
        Booking
      </button>
    </div>
  );
};
