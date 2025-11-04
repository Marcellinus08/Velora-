"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import SchedulePicker from "@/components/call-rates/SchedulePicker";
import PricingDrawer from "@/components/call-rates/PricingDrawer";
import ProductCard from "@/components/call-rates/ProductCard";
import { MicIcon, CamIcon } from "@/components/call-rates/Icons";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

type PrefillResp = {
  abstractId: string;
  slotMinutes: number;
  pricePerSession: { voice: number; video: number };
  items: Array<{
    day: number;
    start: string;
    duration: number;
    kind: "voice" | "video";
    slots: string[];
  }>;
};

type HourBlock = {
  id: string;
  start: string;
  duration: number;
  sessions: { id: string; start: string; end: string; active: boolean }[];
  kinds: { voice: boolean; video: boolean };
};
type DaySchedule = { id: string; day: string; hours: HourBlock[] };

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2)}${Date.now()}`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

function addMin(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const tot = (h * 60 + m + minutes) % (24 * 60);
  const hh = String(Math.floor(tot / 60)).padStart(2, "0");
  const mm = String(tot % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function CallRatesPage() {
  const { address } = useAccount();
  const abstractId = (address ?? "").toLowerCase();

  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<"voice" | "video">("voice");

  // === harga DISIMPAN PER-MENIT untuk input drawer ===
  const [voicePerMin, setVoicePerMin] = useState<number>(0);
  const [videoPerMin, setVideoPerMin] = useState<number>(0);

  // baseline (deteksi perubahan di builder)
  const [initialVoicePerMin, setInitialVoicePerMin] = useState<number>(0);
  const [initialVideoPerMin, setInitialVideoPerMin] = useState<number>(0);

  const [slotMinutes, setSlotMinutes] = useState<number>(10);
  const [initialDays, setInitialDays] = useState<DaySchedule[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!abstractId) return;
      try {
        const res = await fetch(`/api/call-rates/schedules?id=${abstractId}`, { cache: "no-store" });
        const j: PrefillResp = await res.json();
        if (!res.ok) throw new Error((j as any)?.error || res.statusText);

        setSlotMinutes(j.slotMinutes || 10);

        // === session → minute (baseline + current) ===
        const vMin = (j.pricePerSession.voice || 0) / (j.slotMinutes || 10);
        const viMin = (j.pricePerSession.video || 0) / (j.slotMinutes || 10);

        setInitialVoicePerMin(+vMin.toFixed(4));
        setInitialVideoPerMin(+viMin.toFixed(4));
        setVoicePerMin(+vMin.toFixed(4));
        setVideoPerMin(+viMin.toFixed(4));

        // Prefill days → DaySchedule[]
        const map = new Map<string, DaySchedule>();
        for (const it of j.items) {
          const dayName = DAYS[it.day - 1];
          if (!map.has(dayName)) map.set(dayName, { id: uid("day"), day: dayName, hours: [] });
          const sessions = (it.slots || []).map((s) => ({
            id: uid("sess"),
            start: s,
            end: addMin(s, j.slotMinutes || 10),
            active: true,
          }));
          map.get(dayName)!.hours.push({
            id: uid("hour"),
            start: it.start,
            duration: it.duration,
            sessions,
            kinds: { voice: it.kind === "voice", video: it.kind === "video" },
          });
        }
        setInitialDays(Array.from(map.values()));
      } catch (e) {
        console.warn("prefill failed", e);
        setInitialDays([]); // tetap render supaya user bisa buat baru
      }
    })();
  }, [abstractId]);

  const openPricing = (k: "voice" | "video") => {
    setActiveKind(k);
    setPricingOpen(true);
  };

  const handleConfirm = (kind: "voice" | "video", perMin: number) => {
    if (kind === "voice") setVoicePerMin(perMin);
    else setVideoPerMin(perMin);
  };

  const resetPrices = () => {
    setVoicePerMin(0);
    setVideoPerMin(0);
  };

  // Kartu → tampilkan PER-SESI
  const voicePerSession = useMemo(() => voicePerMin * slotMinutes, [voicePerMin, slotMinutes]);
  const videoPerSession = useMemo(() => videoPerMin * slotMinutes, [videoPerMin, slotMinutes]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h1>
        {!abstractId && (
          <p className="mt-2 text-xs text-amber-300">
            Connect your wallet to save schedules (otherwise the server can’t resolve your profile).
          </p>
        )}
      </header>

      {/* pricing cards (per-session) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProductCard
          icon={<MicIcon />}
          title="Voice Calls"
          price={voicePerSession > 0 ? voicePerSession : undefined}
          description={
            voicePerSession > 0
              ? `Current price: ${fmtUSD(voicePerSession)} / session`
              : "Get paid by the session for every voice call."
          }
          cta={voicePerSession > 0 ? "Update pricing" : "Setup pricing"}
          onClick={() => openPricing("voice")}
        />
        <ProductCard
          icon={<CamIcon />}
          title="Video Calls"
          price={videoPerSession > 0 ? videoPerSession : undefined}
          description={
            videoPerSession > 0
              ? `Current price: ${fmtUSD(videoPerSession)} / session`
              : "Get paid by the session for every video call."
          }
          cta={videoPerSession > 0 ? "Update pricing" : "Setup pricing"}
          onClick={() => openPricing("video")}
        />
      </section>

      {/* schedule builder (harga per-menit) */}
      <section className="mt-6">
        <SchedulePicker
          abstractId={abstractId}
          hasVoicePrice={voicePerMin > 0}
          hasVideoPrice={videoPerMin > 0}
          voicePriceUSD={voicePerMin}     // per-minute
          videoPriceUSD={videoPerMin}     // per-minute
          initialVoicePerMin={initialVoicePerMin}
          initialVideoPerMin={initialVideoPerMin}
          currency="USD"
          slotMinutes={slotMinutes}
          initialDays={initialDays || undefined}
          onResetPrices={resetPrices}
          onScheduleAdded={(day, start, slots, kind) => {
            console.log("saved:", { day, start, count: slots.length, kind });
          }}
        />
      </section>

      {/* drawer set price → per-minute input */}
      <PricingDrawer
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        kind={activeKind}
        initialPerMinute={activeKind === "voice" ? voicePerMin : videoPerMin}
        onConfirm={(val) => handleConfirm(activeKind, val)}
      />
    </main>
  );
}
