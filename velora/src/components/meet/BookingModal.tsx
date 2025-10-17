// src/components/meet/BookingModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";

type MeetCreator = {
  id: string; // harus 0x.. address creator (lowercase)
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: { voice?: number; video?: number }; // USD / minute
};

type SessionsResp = {
  slotMinutes: number;
  pricePerSession: { voice: number; video: number }; // USD / session
  byDay: Array<{ day: number; name: string; voice: string[]; video: string[] }>;
};

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    isFinite(n) ? n : 0
  );

const isAddress = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);
const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export const BookingModal = ({
  open,
  onClose,
  creator,
  onBooked,
}: {
  open: boolean;
  onClose: () => void;
  creator: MeetCreator | null;
  onBooked: () => void;
}) => {
  const [kind, setKind] = useState<"voice" | "video">("voice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // sessions
  const [slotMinutes, setSlotMinutes] = useState(10);
  const [days, setDays] = useState<SessionsResp["byDay"]>([]);
  const [dayIdx, setDayIdx] = useState<number>(0);
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [pricePerSession, setPricePerSession] = useState<{
    voice: number;
    video: number;
  }>({ voice: 0, video: 0 });

  const { payMeet } = useGlonicTreasury();

  // ==== Wallet address (dipakai bayar) ====
  const fullAddr = useMemo(() => {
    const cand =
      ((creator as any)?.walletAddress as string | undefined) || (creator?.id ?? "");
    const addr = (cand || "").trim().toLowerCase();
    return isAddress(addr) ? (addr as `0x${string}`) : "";
  }, [creator]);

  const displayAddr = useMemo(() => (fullAddr ? shorten(fullAddr) : ""), [fullAddr]);

  // load sessions ketika modal dibuka
  useEffect(() => {
    if (!open || !creator) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedTimes(new Set());

        const res = await fetch(`/api/meet/sessions?id=${creator.id}`, {
          cache: "no-store",
        });
        const j: SessionsResp = await res.json().catch(() => ({} as any));
        if (!res.ok) throw new Error((j as any)?.error || res.statusText || "Failed");

        setSlotMinutes(j?.slotMinutes || 10);
        setDays(j?.byDay || []);
        setPricePerSession(j?.pricePerSession || { voice: 0, video: 0 });

        // default tab
        const hasVoice = (j?.byDay || []).some((d) => d.voice.length);
        const hasVideo = (j?.byDay || []).some((d) => d.video.length);
        setKind(hasVoice ? "voice" : hasVideo ? "video" : "voice");

        // default hari
        const idx = (j?.byDay || []).findIndex((d) =>
          hasVoice ? d.voice.length : d.video.length
        );
        setDayIdx(idx >= 0 ? idx : 0);
      } catch (e: any) {
        setDays([]);
        setError(e?.message || "Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, creator]);

  // hari yang punya slot utk kind aktif
  const availableDays = useMemo(
    () => days.filter((d) => (kind === "voice" ? d.voice.length : d.video.length)),
    [days, kind]
  );

  // slot utk hari terpilih
  const slotsForDay = useMemo(() => {
    const cur = availableDays[dayIdx] ?? availableDays[0];
    if (!cur) return [];
    return kind === "voice" ? cur.voice : cur.video;
  }, [availableDays, dayIdx, kind]);

  // harga & total
  const sessionPriceUsd = useMemo(
    () => (kind === "voice" ? pricePerSession.voice : pricePerSession.video) || 0,
    [kind, pricePerSession]
  );
  const totalSessions = selectedTimes.size;
  const totalUsd = +(sessionPriceUsd * totalSessions).toFixed(2);

  const perMinute = useMemo(() => {
    const fallback = sessionPriceUsd / Math.max(1, slotMinutes);
    const fromCreators = kind === "voice" ? creator?.pricing.voice : creator?.pricing.video;
    return Number(fromCreators || fallback || 0);
  }, [creator, kind, sessionPriceUsd, slotMinutes]);

  // toggle pilih slot
  const toggleTime = (t: string) => {
    setSelectedTimes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  // helper: tanggal berikutnya utk weekday name
  function nextDateForWeekday(weekdayName: string) {
    const dnames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const target = dnames.indexOf(weekdayName);
    const now = new Date();
    const add = ((target - now.getDay()) % 7 + 7) % 7 || 7;
    const d = new Date(now);
    d.setDate(now.getDate() + add);
    return d.toISOString().slice(0, 10);
  }

  // booking + bayar
  const submit = async () => {
    if (!open || !creator) return;
    if (!fullAddr) {
      setError("Creator wallet invalid.");
      return;
    }
    if (totalSessions === 0) {
      setError("Select at least one session.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // tentukan start/time
      const curDay = availableDays[dayIdx] ?? availableDays[0];
      const dayISO = nextDateForWeekday(curDay?.name || "Monday");
      const first = Array.from(selectedTimes).sort()[0];
      const startAt = `${dayISO}T${first}:00.000Z`;

      const minutes = totalSessions * Math.max(1, slotMinutes);

      // 1) Coba booking ke backend
      let bookingId: string | number | bigint | undefined;
      try {
        const res = await fetch("/api/meet/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creatorId: creator.id,
            kind,
            minutes,
            startAt,
            slots: Array.from(selectedTimes).sort(),
            slotMinutes,
          }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.error || "Booking API failed.");
        bookingId = j?.bookingId ?? j?.id ?? j?.booking_id;
      } catch {
        // 2) Fallback: generate bookingId deterministik (tanpa backend)
        bookingId = `meet:${creator.id}:${kind}:${dayISO}:${Array.from(selectedTimes)
          .sort()
          .join(",")}`;
      }

      // 3) Bayar on-chain
      await payMeet({
        bookingId: bookingId!,
        creator: fullAddr,
        rateUsdPerMin: perMinute,
        minutes,
      });

      onClose();
      onBooked();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Booking or payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !creator) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => !loading && onClose()} />
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl">
        {/* header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
            {creator.avatarUrl ? (
              <img className="h-full w-full object-cover" src={creator.avatarUrl} alt={creator.name} />
            ) : (
              <div className="grid h-full w-full place-items-center text-neutral-400">👤</div>
            )}
          </div>
          <div>
            <div className="font-semibold text-neutral-50">{creator.name}</div>
            <div className="mt-1 text-[11px]">
              {displayAddr ? (
                <span className="text-neutral-400" title={fullAddr}>{displayAddr}</span>
              ) : (
                <span className="text-amber-400">Creator wallet missing/invalid</span>
              )}
            </div>
          </div>
        </div>

        {/* pilih kind */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setKind("voice");
              setSelectedTimes(new Set());
            }}
            disabled={loading}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              kind === "voice"
                ? "bg-[var(--primary-500)] text-white"
                : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            Voice {fmtUSD(pricePerSession.voice)}/session
          </button>
          <button
            type="button"
            onClick={() => {
              setKind("video");
              setSelectedTimes(new Set());
            }}
            disabled={loading}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              kind === "video"
                ? "bg-[var(--primary-500)] text-white"
                : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            Video {fmtUSD(pricePerSession.video)}/session
          </button>
        </div>

        {/* hari */}
        <div className="mb-2 text-sm text-neutral-300">Pick a day</div>
        <div className="mb-3 flex flex-wrap gap-2">
          {availableDays.length === 0 ? (
            <span className="text-xs text-neutral-500">No sessions available.</span>
          ) : (
            availableDays.map((d, i) => (
              <button
                key={d.day}
                onClick={() => {
                  setDayIdx(i);
                  setSelectedTimes(new Set());
                }}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  i === dayIdx
                    ? "bg-[var(--primary-500)] text-white"
                    : "border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                {d.name}
              </button>
            ))
          )}
        </div>

        {/* slot */}
        {!!slotsForDay.length && (
          <>
            <div className="mb-1 text-sm text-neutral-300">
              Available sessions ({slotMinutes} min each)
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {slotsForDay.map((t) => {
                const active = selectedTimes.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTime(t)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      active
                        ? "border border-black bg-black text-white"
                        : "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ringkasan */}
        <div className="mt-2 text-sm text-neutral-300">
          Price: <span className="font-semibold text-neutral-100">{fmtUSD(sessionPriceUsd)}</span> / session
          {" — "}Sessions: <span className="font-semibold text-neutral-100">{totalSessions}</span>
          {" — "}Total: <span className="font-semibold text-neutral-100">{fmtUSD(totalUsd)}</span>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-800/60 bg-red-900/20 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading || totalSessions === 0 || !fullAddr}
            title={!fullAddr ? "Invalid creator wallet" : ""}
            className="rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            {loading ? "Booking..." : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};
