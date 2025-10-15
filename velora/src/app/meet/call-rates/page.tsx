"use client";

import React, { useEffect, useState } from "react";
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

export default function CallRatesPage() {
  const { address } = useAccount();
  const abstractId = (address ?? "").toLowerCase();

  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<"voice" | "video">("voice");

  // disimpan PER MENIT (input drawer)
  const [voicePerMinute, setVoicePerMinute] = useState<number>(0);
  const [videoPerMinute, setVideoPerMinute] = useState<number>(0);

  // konversi untuk tampilan: PER SESI (10 menit)
  const voicePerSession = voicePerMinute * 10;
  const videoPerSession = videoPerMinute * 10;

  useEffect(() => {
    try {
      const v = window.localStorage.getItem("velora.pricing.voice.permin");
      const vv = window.localStorage.getItem("velora.pricing.video.permin");
      if (v) setVoicePerMinute(Number(v) || 0);
      if (vv) setVideoPerMinute(Number(vv) || 0);
    } catch {}
  }, []);

  const openPricing = (k: "voice" | "video") => {
    setActiveKind(k);
    setPricingOpen(true);
  };

  const handleConfirm = (kind: "voice" | "video", perMinute: number) => {
    try {
      const key = kind === "voice" ? "velora.pricing.voice.permin" : "velora.pricing.video.permin";
      window.localStorage.setItem(key, String(perMinute));
    } catch {}
    if (kind === "voice") setVoicePerMinute(perMinute);
    else setVideoPerMinute(perMinute);
  };

  const resetPrices = () => {
    setVoicePerMinute(0);
    setVideoPerMinute(0);
    try {
      localStorage.removeItem("velora.pricing.voice.permin");
      localStorage.removeItem("velora.pricing.video.permin");
    } catch {}
  };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h1>
        <p className="mt-1 max-w-[68ch] text-sm text-neutral-300">
          Set your per-minute rate for Voice and Video calls. We’ll show it as
          <span className="font-medium text-neutral-100"> per session (10 min)</span> to buyers.
        </p>
        {!abstractId && (
          <p className="mt-2 text-xs text-amber-300">
            Connect your wallet to save schedules (otherwise the server can’t resolve your profile).
          </p>
        )}
      </header>

      {/* pricing cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProductCard
          icon={<MicIcon />}
          title="Voice Calls"
          // tampilkan PER SESI
          description={
            voicePerSession > 0
              ? `Current price: ${fmtUSD(voicePerSession)} / session`
              : "Get paid by the session for every voice call."
          }
          cta={voicePerMinute > 0 ? "Update pricing" : "Setup pricing"}
          onClick={() => openPricing("voice")}
          // pill (opsional) juga per sesi
          price={voicePerSession}
          unitLabel="/ session"
        />
        <ProductCard
          icon={<CamIcon />}
          title="Video Calls"
          description={
            videoPerSession > 0
              ? `Current price: ${fmtUSD(videoPerSession)} / session`
              : "Get paid by the session for every video call."
          }
          cta={videoPerMinute > 0 ? "Update pricing" : "Setup pricing"}
          onClick={() => openPricing("video")}
          price={videoPerSession}
          unitLabel="/ session"
        />
      </section>

      {/* schedule builder */}
      <section className="mt-6">
        <SchedulePicker
          abstractId={abstractId}
          hasVoicePrice={voicePerMinute > 0}
          hasVideoPrice={videoPerMinute > 0}
          // kirim PER MENIT → komponen akan konversi ke per-session (×10) ketika menyimpan
          voicePricePerMinuteUSD={voicePerMinute}
          videoPricePerMinuteUSD={videoPerMinute}
          currency="USD"
          onResetPrices={resetPrices}
          onScheduleAdded={(day, start, slots, kind) => {
            console.log("saved:", { day, start, count: slots.length, kind });
          }}
        />
      </section>

      {/* drawer set price (per minute) */}
      <PricingDrawer
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        kind={activeKind}
        initialPerMinute={activeKind === "voice" ? voicePerMinute : videoPerMinute}
        onConfirm={(val) => handleConfirm(activeKind, val)}
      />
    </main>
  );
}
