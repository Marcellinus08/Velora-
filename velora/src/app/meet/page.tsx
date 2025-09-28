// src/app/meet/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";

type ProductKind = "voice" | "video";

/* ===== Utilities ===== */
function formatUsd(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace("US$", "$");
}

/* ===== Icons (warna ikut currentColor) ===== */
const MicIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3M8 22h8" />
  </svg>
);

const CamIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 9l6-3v12l-6-3z" />
  </svg>
);

/* ===== Pricing Sheet ===== */
function PricingModal({
  open,
  onClose,
  kind,
  initialPerMinute,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  kind: ProductKind;
  initialPerMinute: number;
  onConfirm: (perMinute: number) => void;
}) {
  const [perMinute, setPerMinute] = useState(initialPerMinute);
  useEffect(() => setPerMinute(initialPerMinute), [initialPerMinute]);

  const price15 = useMemo(() => perMinute * 15, [perMinute]);
  const price30 = useMemo(() => perMinute * 30, [perMinute]);
  const price60 = useMemo(() => perMinute * 60, [perMinute]);

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-neutral-950 border-l border-neutral-800 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4">
          <button onClick={onClose} className="rounded-xl p-2 text-neutral-300 hover:bg-neutral-800/60" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-[20px] font-semibold text-neutral-50">
            Set your price ({kind === "voice" ? "Voice" : "Video"})
          </h3>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-sm text-neutral-300">Set your price per minute for all calls</p>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
              <input
                inputMode="decimal"
                value={perMinute || ""}
                onChange={(e) => setPerMinute(Number(e.target.value) || 0)}
                placeholder="0"
                className="h-12 w-full rounded-2xl border border-neutral-800 bg-neutral-900 pl-6 pr-16 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                / minute
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[5, 10, 25].map((v) => (
                <button
                  key={v}
                  onClick={() => setPerMinute(v)}
                  className="h-11 rounded-2xl border border-neutral-700 bg-neutral-900 px-5 text-sm text-neutral-200 hover:bg-neutral-800"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-50">Price per call</p>
            <div className="space-y-2 text-neutral-100">
              <Row label="15 minutes" value={formatUsd(price15)} />
              <Row label="30 minutes" value={formatUsd(price30)} />
              <Row label="60 minutes" value={formatUsd(price60)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-6">
          <button className="h-12 w-full rounded-2xl bg-violet-600 font-semibold text-white hover:bg-violet-500" onClick={() => { onConfirm(perMinute); onClose(); }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-300">{label}</span>
      <span className="font-medium text-neutral-100">{value}</span>
    </div>
  );
}

/* ===== Product Card (font & warna diseragamkan) ===== */
function ProductCard({
  icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="group relative h-full min-h-[220px] rounded-[22px] border border-neutral-800 bg-gradient-to-b from-neutral-800/40 to-neutral-800/10 p-6 transition-colors hover:border-neutral-700">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-neutral-700 bg-neutral-800/70 text-neutral-200">
        {icon}
      </div>

      <h4 className="text-[22px] font-semibold leading-tight text-neutral-50">{title}</h4>
      <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-neutral-300">{description}</p>

      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-violet-400 hover:text-violet-300"
      >
        {cta}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ===== Page ===== */
export default function MeetPage() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<ProductKind>("voice");
  const [voicePerMinute, setVoicePerMinute] = useState<number>(() => (typeof window === "undefined" ? 0 : Number(localStorage.getItem("velora.pricing.voice") ?? 0)));
  const [videoPerMinute, setVideoPerMinute] = useState<number>(() => (typeof window === "undefined" ? 0 : Number(localStorage.getItem("velora.pricing.video") ?? 0)));

  const openPricing = (k: ProductKind) => {
    setActiveKind(k);
    setPricingOpen(true);
  };

  async function handleConfirm(kind: ProductKind, val: number) {
    const key = kind === "voice" ? "velora.pricing.voice" : "velora.pricing.video";
    localStorage.setItem(key, String(val));
    if (kind === "voice") setVoicePerMinute(val);
    else setVideoPerMinute(val);
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProductCard
              icon={<MicIcon />}
              title="Voice Calls"
              description="Get paid by the minute for every voice call."
              cta="Setup pricing"
              onClick={() => openPricing("voice")}
            />
            <ProductCard
              icon={<CamIcon />}
              title="Video Calls"
              description="Get paid by the minute for every video call."
              cta="Setup pricing"
              onClick={() => openPricing("video")}
            />
          </div>

          {/* Ringkasan harga dengan font & warna sama */}
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex h-14 items-center rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-neutral-300">Voice per minute</span>
                <span className="font-semibold text-neutral-100">{formatUsd(voicePerMinute)}</span>
              </div>
            </div>
            <div className="flex h-14 items-center rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-neutral-300">Video per minute</span>
                <span className="font-semibold text-neutral-100">{formatUsd(videoPerMinute)}</span>
              </div>
            </div>
          </div>
        </div>

        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          kind={activeKind}
          initialPerMinute={activeKind === "voice" ? voicePerMinute : videoPerMinute}
          onConfirm={(val) => handleConfirm(activeKind, val)}
        />
      </main>
    </div>
  );
}
