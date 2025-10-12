// src/components/meet/BookingModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";

type MeetCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  walletAddress?: string;  // optional
  abstractId?: string;     // optional
  pricing: { voice: number; video: number; }; // USD per minute
};

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  creator: MeetCreator | null;
  onBooked: () => void;
};

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const isAddress = (s?: string | null) => !!s && /^0x[a-fA-F0-9]{40}$/.test(s);

export const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, creator, onBooked }) => {
  const [kind, setKind] = useState<"voice" | "video">("voice");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [minutes, setMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { payMeet } = useGlonicTreasury();

  useEffect(() => {
    if (!open || !creator) return;
    const now = new Date(Date.now() + 30 * 60 * 1000);
    setKind("voice");
    setDate(now.toISOString().slice(0, 10));
    setTime(now.toTimeString().slice(0, 5));
    setMinutes(15);
    setError(null);
    setLoading(false);
  }, [open, creator]);

  const creatorAddr = useMemo(() => {
    const raw = creator?.walletAddress || creator?.abstractId || "";
    return isAddress(raw) ? (raw as `0x${string}`) : undefined;
  }, [creator]);

  const rate = useMemo(() => {
    if (!creator) return 0;
    return kind === "voice" ? Number(creator.pricing.voice || 0) : Number(creator.pricing.video || 0);
  }, [creator, kind]);

  const totalUsd = useMemo(() => {
    const m = Math.max(1, Math.ceil(Number(minutes || 0)));
    return Math.max(0, rate * m);
  }, [rate, minutes]);

  const submit = async () => {
    try {
      if (!open || !creator) return;
      setLoading(true);
      setError(null);
      if (!date || !time) throw new Error("Select date & time");
      if (!creatorAddr) throw new Error("Creator wallet invalid");
      if (rate <= 0) throw new Error("Rate must be > 0");

      const mins = Math.max(1, Math.ceil(Number(minutes)));
      const startAt = new Date(`${date}T${time}:00`).toISOString();

      // 1) Buat booking di backend → ambil bookingId
      const res = await fetch("/api/meet/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id, kind, minutes: mins, startAt }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Booking failed");
      }
      const j = await res.json().catch(() => ({}));
      const bookingId = j?.bookingId ?? j?.id;
      if (bookingId === undefined || bookingId === null) throw new Error("Booking created but no bookingId returned");

      // 2) Bayar on-chain
      const tx = await payMeet({
        bookingId,
        creator: creatorAddr,
        rateUsdPerMin: rate,
        minutes: mins,
      });
      alert(`Booking & payment success!\nBooking #${bookingId}\nTx: ${tx}`);

      onClose();
      onBooked();
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "Something went wrong";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !creator) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => !loading && onClose()} />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl transition">
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
            <div className="text-xs text-neutral-400">@{creator.handle}</div>
            {!creatorAddr && (
              <div className="mt-1 text-[11px] text-amber-400">Creator wallet missing/invalid</div>
            )}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind("voice")}
            disabled={loading}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              kind === "voice" ? "bg-[var(--primary-500)] text-white"
                                : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"}`}
          >
            Voice {fmtUSD(creator.pricing.voice)}/min
          </button>
          <button
            type="button"
            onClick={() => setKind("video")}
            disabled={loading}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              kind === "video" ? "bg-[var(--primary-500)] text-white"
                               : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"}`}
          >
            Video {fmtUSD(creator.pricing.video)}/min
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Date</label>
            <input type="date" value={date} disabled={loading} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-[var(--primary-500)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">Time</label>
            <input type="time" value={time} disabled={loading} onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-[var(--primary-500)]" />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-neutral-400">Minutes</label>
          <input type="number" min={1} step={1} value={minutes} disabled={loading}
            onChange={(e) => setMinutes(Math.max(1, Number(e.target.value || 1)))}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-[var(--primary-500)]" />
          <div className="mt-2 text-xs text-neutral-400">
            Rate: <span className="font-semibold text-neutral-200">{fmtUSD(rate)}</span> / min — Total:{" "}
            <span className="font-semibold text-neutral-200">{fmtUSD(totalUsd)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-800/60 bg-red-900/20 px-3 py-2 text-sm text-red-300">{error}</div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60">
            Cancel
          </button>

          <button type="button" onClick={submit}
            disabled={loading || !creatorAddr || rate <= 0 || totalUsd <= 0 || !date || !time}
            className="rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
            title={
              !creatorAddr ? "Invalid creator wallet"
              : rate <= 0 ? "Invalid rate"
              : totalUsd <= 0 ? "Total must be > 0"
              : !date || !time ? "Select date & time"
              : ""
            }>
            {loading ? "Booking..." : "Confirm & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
};
