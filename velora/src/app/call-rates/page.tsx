  // src/app/call-rates/page.tsx
  "use client";

  import React, { useEffect, useMemo, useState } from "react";

  /* =========================
    Utils
  ========================= */
  const fmtUSD = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isFinite(n) ? n : 0);

  type Kind = "voice" | "video";

  /* =========================
    Small icons
  ========================= */
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

  /* =========================
    Small pieces
  ========================= */
  function Row({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-300">{label}</span>
        <span className="font-medium text-neutral-100">{value}</span>
      </div>
    );
  }

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
        <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-neutral-300">{description}</p>

        <button
          onClick={onClick}
          className="mt-5 inline-flex items-center gap-2 text-[15px] font-medium text-[var(--primary-500)] hover:opacity-90"
        >
          {cta}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  /* =========================
    Pricing Drawer (supports 0.xx)
  ========================= */
  function PricingDrawer({
    open,
    onClose,
    kind,
    initialPerMinute,
    onConfirm,
  }: {
    open: boolean;
    onClose: () => void;
    kind: Kind;
    initialPerMinute: number;
    onConfirm: (perMinute: number) => void;
  }) {
    // pakai string agar input "0.xx" mulus
    const [perMinuteStr, setPerMinuteStr] = useState<string>(String(initialPerMinute ?? ""));
    useEffect(() => setPerMinuteStr(String(initialPerMinute ?? "")), [initialPerMinute, open]);

    const perMinute = useMemo(() => {
      const normalized = perMinuteStr.replace(",", ".").trim();
      const n = parseFloat(normalized);
      return isNaN(n) || n < 0 ? 0 : n;
    }, [perMinuteStr]);

    const price15 = useMemo(() => perMinute * 15, [perMinute]);
    const price30 = useMemo(() => perMinute * 30, [perMinute]);
    const price60 = useMemo(() => perMinute * 60, [perMinute]);

    // contoh harga: 4 opsi saja (termasuk sub-$1)
    const quick = [0.25, 1, 5, 10];

    return (
      <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-neutral-950 border-l border-neutral-800 transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-4">
            <button onClick={onClose} className="rounded-xl p-2 text-neutral-300 hover:bg-neutral-800/60" aria-label="Close">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-[20px] font-semibold text-neutral-50">Set your price ({kind === "voice" ? "Voice" : "Video"})</h3>
          </div>

          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm text-neutral-300">Price per minute (USD)</p>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                <input
                  inputMode="decimal"
                  value={perMinuteStr}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const cleaned = raw.replace(/[^\d.,\s]/g, "");
                    setPerMinuteStr(cleaned);
                  }}
                  placeholder="0"
                  className="h-12 w-full rounded-2xl border border-neutral-800 bg-neutral-900 pl-6 pr-16 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">/ minute</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {quick.map((v) => (
                  <button
                    key={v}
                    onClick={() => setPerMinuteStr(String(v))}
                    className="h-11 rounded-2xl border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-200 hover:bg-neutral-800"
                  >
                    {fmtUSD(v)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-50">Quick preview</p>
              <div className="space-y-2 text-neutral-100">
                <Row label="15 minutes" value={fmtUSD(price15)} />
                <Row label="30 minutes" value={fmtUSD(price30)} />
                <Row label="60 minutes" value={fmtUSD(price60)} />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 p-6">
            <button
              className="h-12 w-full rounded-2xl bg-[var(--primary-500)] font-semibold text-white hover:opacity-90"
              onClick={() => {
                onConfirm(perMinute);
                onClose();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
    Earnings Estimator — 2 kartu rapih
  ========================= */
  function Estimator({
    voicePerMinute,
    videoPerMinute,
  }: {
    voicePerMinute: number;
    videoPerMinute: number;
  }) {
    const [tab, setTab] = useState<Kind>("voice");
    const [minutes, setMinutes] = useState(30);

    const rate = tab === "voice" ? voicePerMinute : videoPerMinute;
    const gross = Math.max(0, rate) * minutes;
    const creator = gross * 0.8;
    const platform = gross * 0.2;

    return (
      <section className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-neutral-50">Earnings Estimator</h4>
          <div className="flex gap-1 rounded-xl border border-neutral-800 p-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm ${
                tab === "voice" ? "bg-neutral-800 text-neutral-100" : "text-neutral-300 hover:bg-neutral-800/60"
              }`}
              onClick={() => setTab("voice")}
            >
              Voice
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-sm ${
                tab === "video" ? "bg-neutral-800 text-neutral-100" : "text-neutral-300 hover:bg-neutral-800/60"
              }`}
              onClick={() => setTab("video")}
            >
              Video
            </button>
          </div>
        </div>

        {/* slider full width */}
        <label className="mb-2 block text-sm text-neutral-300">Call duration (minutes)</label>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-[var(--primary-500)]"
        />
        <div className="mt-1 text-xs text-neutral-400">{minutes} minutes</div>

        {/* dua kartu sejajar */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* kiri: earnings split */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 min-h-[140px]">
            <Row label="You earn (80%)" value={fmtUSD(creator)} />
            <div className="mt-3" />
            <Row label="Platform (20%)" value={fmtUSD(platform)} />
            <p className="mt-3 text-xs text-neutral-500">
              Total price: {fmtUSD(gross)} ({fmtUSD(rate)} × {minutes} min)
            </p>
          </div>

          {/* kanan: price details */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 min-h-[140px]">
            <Row label="Price per minute" value={fmtUSD(rate)} />
            <div className="mt-3" />
            <Row label="Total price" value={fmtUSD(gross)} />
            <p className="mt-3 text-xs text-neutral-500">
              {fmtUSD(rate)} × {minutes} min
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          This is an estimate for illustration only. Final amounts may vary due to fees, rounding, and on-chain costs.
        </p>
      </section>
    );
  }

  /* =========================
    Page
  ========================= */
  export default function CallRatesPage() {
    const [pricingOpen, setPricingOpen] = useState(false);
    const [activeKind, setActiveKind] = useState<Kind>("voice");

    const [voicePerMinute, setVoicePerMinute] = useState<number>(1);
    const [videoPerMinute, setVideoPerMinute] = useState<number>(5);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      try {
        const v = window.localStorage.getItem("velora.pricing.voice");
        const vv = window.localStorage.getItem("velora.pricing.video");
        if (v) setVoicePerMinute(Number(v) || 0);
        if (vv) setVideoPerMinute(Number(vv) || 0);
      } catch {}
      setMounted(true);
    }, []);

    const openPricing = (k: Kind) => {
      setActiveKind(k);
      setPricingOpen(true);
    };

    function handleConfirm(kind: Kind, val: number) {
      try {
        const key = kind === "voice" ? "velora.pricing.voice" : "velora.pricing.video";
        window.localStorage.setItem(key, String(val));
      } catch {}
      if (kind === "voice") setVoicePerMinute(val);
      else setVideoPerMinute(val);
    }

    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-50">Set Your Call Rates</h1>
          <p className="mt-1 max-w-[68ch] text-sm text-neutral-300">
            Set your per-minute rate for <span className="font-medium text-neutral-100">Voice</span> and{" "}
            <span className="font-medium text-neutral-100">Video</span> calls. You can update it anytime.
          </p>
        </header>

        {/* Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        </section>

        {/* Current summary */}
        <section className="mt-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="flex h-14 items-center rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-neutral-300">Voice per minute</span>
              <span className="font-semibold text-neutral-100" suppressHydrationWarning>
                {mounted ? fmtUSD(voicePerMinute) : "$0.00"}
              </span>
            </div>
          </div>
          <div className="flex h-14 items-center rounded-2xl border border-neutral-800 bg-neutral-900 px-4">
            <div className="flex w-full items-center justify-between">
              <span className="text-neutral-300">Video per minute</span>
              <span className="font-semibold text-neutral-100" suppressHydrationWarning>
                {mounted ? fmtUSD(videoPerMinute) : "$0.00"}
              </span>
            </div>
          </div>
        </section>

        {/* FAQ (short) */}
        <section className="mt-8 space-y-3">
          <details className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <summary className="cursor-pointer list-none font-medium text-neutral-100">Can I change my rates anytime?</summary>
            <p className="mt-2 text-sm text-neutral-300">
              Yes. Rates apply to future bookings. Ongoing calls keep the rate they started with.
            </p>
          </details>
          <details className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <summary className="cursor-pointer list-none font-medium text-neutral-100">How are call charges calculated?</summary>
            <p className="mt-2 text-sm text-neutral-300">
              We bill per minute. The platform takes 20% and you receive 80% of the call revenue.
            </p>
          </details>
        </section>

        {/* Estimator */}
        <Estimator voicePerMinute={voicePerMinute} videoPerMinute={videoPerMinute} />

        {/* Drawer */}
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
