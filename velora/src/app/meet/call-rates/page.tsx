// src/app/call-rates/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import SchedulePicker from "@/components/call-rates/SchedulePicker";
import PricingDrawer from "@/components/call-rates/PricingDrawer";
import ProductCard from "@/components/call-rates/ProductCard";
import { MicIcon, CamIcon } from "@/components/call-rates/Icons";

// Format USD function
const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

export default function CallRatesPage() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<"voice" | "video">("voice");

  const [voicePerSession, setVoicePerSession] = useState<number>(0);
  const [videoPerSession, setVideoPerSession] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem("velora.pricing.voice");
      const vv = window.localStorage.getItem("velora.pricing.video");
      if (v) setVoicePerSession(Number(v) || 0);
      if (vv) setVideoPerSession(Number(vv) || 0);
    } catch {}
    setMounted(true);
  }, []);

  const openPricing = (k: "voice" | "video") => {
    setActiveKind(k);
    setPricingOpen(true);
  };

  const handleConfirm = (kind: "voice" | "video", val: number) => {
    try {
      const key = kind === "voice" ? "velora.pricing.voice" : "velora.pricing.video";
      window.localStorage.setItem(key, String(val));
    } catch {}
    if (kind === "voice") setVoicePerSession(val);
    else setVideoPerSession(val);
  };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h1>
        <p className="mt-1 max-w-[68ch] text-sm text-neutral-300">
          Set your per-session rate for <span className="font-medium text-neutral-100">Voice</span> and{" "}
          <span className="font-medium text-neutral-100">Video</span> calls. You can update it anytime.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProductCard
          icon={<MicIcon />}
          title="Voice Calls"
          description="Get paid by the session for every voice call."
          cta="Setup pricing"
          onClick={() => openPricing("voice")}
        />
        <ProductCard
          icon={<CamIcon />}
          title="Video Calls"
          description="Get paid by the session for every video call."
          cta="Setup pricing"
          onClick={() => openPricing("video")}
        />
      </section>

      <section className="mt-6">
        <SchedulePicker onScheduleAdded={(day, startTime, slots) => console.log(day, startTime, slots)} />
      </section>

      <PricingDrawer
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        kind={activeKind}
        initialPerSession={activeKind === "voice" ? voicePerSession : videoPerSession}
        onConfirm={(val) => handleConfirm(activeKind, val)}
      />
    </main>
  );
}
