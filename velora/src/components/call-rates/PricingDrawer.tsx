import React, { useState, useMemo, useEffect } from "react";
import Row from "./Row";

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

/**
 * Drawer input **per-minute**.
 * - `initialPerMinute` dipakai untuk prefill kalau user sudah pernah mengisi (contoh:
 *   DB menyimpan $50 / session → drawer otomatis menampilkan $5 / min jika slot=10).
 */
function PricingDrawer({
  open,
  onClose,
  kind,
  initialPerMinute,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  kind: "voice" | "video";
  initialPerMinute: number; // <<— prefill dari halaman
  onConfirm: (perMinute: number) => void;
}) {
  const [perMinuteStr, setPerMinuteStr] = useState<string>("");

  // Prefill saat drawer dibuka / kind berubah
  useEffect(() => {
    if (!open) return;
    setPerMinuteStr(
      initialPerMinute && initialPerMinute > 0 ? String(initialPerMinute) : ""
    );
  }, [open, kind, initialPerMinute]);

  // Normalisasi angka
  const perMinute = useMemo(() => {
    const normalized = perMinuteStr.replace(",", ".").trim();
    const n = parseFloat(normalized);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [perMinuteStr]);

  // quick preview per-session (10/20/40 menit)
  const s10 = useMemo(() => perMinute * 10, [perMinute]);
  const s20 = useMemo(() => perMinute * 20, [perMinute]);
  const s40 = useMemo(() => perMinute * 40, [perMinute]);

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
          <h3 className="text-[20px] font-semibold text-neutral-50">
            Set your price ({kind === "voice" ? "Voice" : "Video"})
          </h3>
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
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">/ min</span>
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
            <p className="text-sm font-medium text-neutral-50">Quick preview (per session)</p>
            <div className="space-y-2 text-neutral-100">
              <Row label="10 minutes (1 session)" value={fmtUSD(s10)} />
              <Row label="20 minutes (2 sessions)" value={fmtUSD(s20)} />
              <Row label="40 minutes (4 sessions)" value={fmtUSD(s40)} />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 p-6">
          <button
            className="h-12 w-full rounded-2xl bg-[var(--primary-500)] font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              onConfirm(perMinute);
              onClose();
            }}
            disabled={perMinute <= 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingDrawer;
