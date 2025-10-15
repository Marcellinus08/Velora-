// components/meet/MeetCard.tsx
import React, { useMemo } from "react";

const SESSION_MINUTES = 10; // hanya untuk tampilan; slotMinutes real ada di API sessions

const isAddress = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);
const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

type MeetCardProps = {
  creator: {
    id: string; // abstract_id (lowercase 0x…)
    name: string;
    handle: string;
    avatarUrl?: string;
    pricing: { voice?: number; video?: number }; // per minute
    // optional; kalau suatu saat kamu simpan wallet di field terpisah:
    walletAddress?: string;
  };
  onCall: (c: any) => void;
};

export const MeetCard: React.FC<MeetCardProps> = ({ creator, onCall }) => {
  // alamat wallet untuk display & bayar
  const fullAddr = useMemo(() => {
    const cand = (creator as any).walletAddress || creator.id || "";
    const addr = (cand as string).trim();
    return isAddress(addr) ? (addr as `0x${string}`) : "";
  }, [creator]);

  const displayAddr = useMemo(() => (fullAddr ? shorten(fullAddr) : ""), [fullAddr]);

  const toSession = (perMin?: number) =>
    typeof perMin === "number" ? perMin * SESSION_MINUTES : undefined;

  const voiceSession = toSession(creator.pricing?.voice);
  const videoSession = toSession(creator.pricing?.video);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-all hover:border-[var(--primary-500)] hover:bg-neutral-900/80 hover:shadow-[0_0_0_1px_var(--primary-500),0_0_24px_2px_rgba(139,92,246,0.45)]">
      {/* Header: avatar + name + wallet */}
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
          <div className="mt-1 text-[11px]">
            {displayAddr ? (
              <span className="text-neutral-400">
                {displayAddr}
              </span>
            ) : (
              <span className="text-amber-400">Creator wallet missing/invalid</span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing (per session) */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs uppercase tracking-wide text-neutral-400">Voice</div>
          <div className="text-sm font-semibold text-neutral-100">
            {typeof voiceSession === "number"
              ? `$${voiceSession.toFixed(2)}/session`
              : "No sessions available"}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-3">
          <div className="text-xs uppercase tracking-wide text-neutral-400">Video</div>
          <div className="text-sm font-semibold text-neutral-100">
            {typeof videoSession === "number"
              ? `$${videoSession.toFixed(2)}/session`
              : "No sessions available"}
          </div>
        </div>
      </div>

      <button
        className="w-full rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        onClick={() => onCall(creator)}
      >
        Booking
      </button>
    </div>
  );
};

export default MeetCard;
