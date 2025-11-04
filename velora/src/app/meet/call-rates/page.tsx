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
  // const { address } = useAccount();
  // const abstractId = (address ?? "").toLowerCase();

  // const [pricingOpen, setPricingOpen] = useState(false);
  // const [activeKind, setActiveKind] = useState<"voice" | "video">("voice");

  // // === harga DISIMPAN PER-MENIT untuk input drawer ===
  // const [voicePerMin, setVoicePerMin] = useState<number>(0);
  // const [videoPerMin, setVideoPerMin] = useState<number>(0);

  // // baseline (deteksi perubahan di builder)
  // const [initialVoicePerMin, setInitialVoicePerMin] = useState<number>(0);
  // const [initialVideoPerMin, setInitialVideoPerMin] = useState<number>(0);

  // const [slotMinutes, setSlotMinutes] = useState<number>(10);
  // const [initialDays, setInitialDays] = useState<DaySchedule[] | null>(null);

  // useEffect(() => {
  //   (async () => {
  //     if (!abstractId) return;
  //     try {
  //       const res = await fetch(`/api/call-rates/schedules?id=${abstractId}`, { cache: "no-store" });
  //       const j: PrefillResp = await res.json();
  //       if (!res.ok) throw new Error((j as any)?.error || res.statusText);

  //       setSlotMinutes(j.slotMinutes || 10);

  //       // === session → minute (baseline + current) ===
  //       const vMin = (j.pricePerSession.voice || 0) / (j.slotMinutes || 10);
  //       const viMin = (j.pricePerSession.video || 0) / (j.slotMinutes || 10);

  //       setInitialVoicePerMin(+vMin.toFixed(4));
  //       setInitialVideoPerMin(+viMin.toFixed(4));
  //       setVoicePerMin(+vMin.toFixed(4));
  //       setVideoPerMin(+viMin.toFixed(4));

  //       // Prefill days → DaySchedule[]
  //       const map = new Map<string, DaySchedule>();
  //       for (const it of j.items) {
  //         const dayName = DAYS[it.day - 1];
  //         if (!map.has(dayName)) map.set(dayName, { id: uid("day"), day: dayName, hours: [] });
  //         const sessions = (it.slots || []).map((s) => ({
  //           id: uid("sess"),
  //           start: s,
  //           end: addMin(s, j.slotMinutes || 10),
  //           active: true,
  //         }));
  //         map.get(dayName)!.hours.push({
  //           id: uid("hour"),
  //           start: it.start,
  //           duration: it.duration,
  //           sessions,
  //           kinds: { voice: it.kind === "voice", video: it.kind === "video" },
  //         });
  //       }
  //       setInitialDays(Array.from(map.values()));
  //     } catch (e) {
  //       console.warn("prefill failed", e);
  //       setInitialDays([]); // tetap render supaya user bisa buat baru
  //     }
  //   })();
  // }, [abstractId]);

  // const openPricing = (k: "voice" | "video") => {
  //   setActiveKind(k);
  //   setPricingOpen(true);
  // };

  // const handleConfirm = (kind: "voice" | "video", perMin: number) => {
  //   if (kind === "voice") setVoicePerMin(perMin);
  //   else setVideoPerMin(perMin);
  // };

  // const resetPrices = () => {
  //   setVoicePerMin(0);
  //   setVideoPerMin(0);
  // };

  // // Kartu → tampilkan PER-SESI
  // const voicePerSession = useMemo(() => voicePerMin * slotMinutes, [voicePerMin, slotMinutes]);
  // const videoPerSession = useMemo(() => videoPerMin * slotMinutes, [videoPerMin, slotMinutes]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h1>
        <p className="mt-2 text-xs text-amber-300">
          This feature is coming soon. Stay tuned! 🚀
        </p>
      </header>

      {/* Coming Soon Banner - Full Width */}
      <div className="h-80 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/80 via-blue-950/60 to-purple-950/80 px-6 py-8 text-neutral-300 transition-all duration-300 flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/40 relative overflow-hidden group">
        {/* Animated background with moving gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/30 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        
        {/* Top light rays */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-b from-purple-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-purple-500/60 transition-all duration-500" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-gradient-to-b from-blue-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-blue-500/60 transition-all duration-500" />
        
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-48 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:from-purple-500/40 transition-all duration-500" />
        
        {/* Border glow */}
        <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover:border-purple-400/50 transition-all duration-300" />
        
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
          {/* Icon container with 3D effect */}
          <div className="relative">
            {/* Rotating ring */}
            <div className="absolute inset-0 rounded-xl border border-purple-500/30 group-hover:border-purple-400/60 transition-all duration-300" style={{ animation: 'spin 3s linear infinite' }} />
            
            {/* Glow layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/20 rounded-lg blur-lg group-hover:from-purple-500/60 group-hover:to-blue-500/40 transition-all duration-300" />
            
            {/* Main icon */}
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg px-6 py-3 shadow-xl shadow-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-400/70 transition-all duration-300">
              <span className="material-icons-round text-white text-5xl leading-none block">settings</span>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 group-hover:from-purple-100 group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-300 animate-pulse" style={{ animationDuration: '3s' }}>
              Coming Soon
            </div>
            <div className="text-lg text-purple-200/80 group-hover:text-purple-100 transition-colors duration-300 font-semibold tracking-wide mt-2">
              📊 Call rates feature launching soon
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-8 right-12 text-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
          <div className="absolute bottom-8 right-16 text-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-bounce" style={{ animationDelay: '0.2s' }}>🚀</div>
          <div className="absolute top-1/3 left-8 text-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-bounce" style={{ animationDelay: '0.4s' }}>💫</div>
        </div>
      </div>

      {/* Pricing cards section - commented for future use */}
      {/* pricing cards (per-session) */}
      {/* <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      </section> */}

      {/* schedule builder (harga per-menit) - commented for future use */}
      {/* <section className="mt-6">
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
      </section> */}

      {/* drawer set price → per-minute input - commented for future use */}
      {/* <PricingDrawer
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        kind={activeKind}
        initialPerMinute={activeKind === "voice" ? voicePerMin : videoPerMin}
        onConfirm={(val) => handleConfirm(activeKind, val)}
      /> */}
    </main>
  );
}
