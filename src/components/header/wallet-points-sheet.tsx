"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MI } from "./MI";

type TabKey = "points" | "usdce" | "limbo";

export default function WalletPointsSheet({
  open,
  initialTab = "points",
  onClose,
  usdce = {
    availableUsd: "$0.00",
    portfolioUsd: "$0.00",
    pnlUsd: "$0",
    address: "",
  },
  points = {
    availablePts: 2500,
    portfolioPts: 0,
    pnlPts: 0,
    level: "Bronze",
    progressPct: 50,
  },
}: {
  open: boolean;
  initialTab?: TabKey;
  onClose: () => void;
  usdce?: {
    availableUsd: string; // contoh "$5.03"
    portfolioUsd: string; // contoh "$0.01"
    pnlUsd: string; // contoh "$0"
    address?: string;
  };
  points?: {
    availablePts: number; // contoh 2500
    portfolioPts: number; // contoh 0
    pnlPts: number; // contoh 0
    level?: string; // "Bronze"
    progressPct?: number; // 0-100
  };
}) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  useEffect(() => setTab(initialTab), [initialTab]);

  // helpers
  const fmtPts = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1).replace(".0", "")}k pts` : `${n} pts`;

  return (
    <div
      className={`fixed inset-0 z-[90] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* sheet */}
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-neutral-950 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-800">
              <MI name="account_balance_wallet" className="text-[18px]" />
            </div>
            <h3 className="text-base font-semibold">My wallet</h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800"
          >
            <MI name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-4 border-b border-neutral-800">
            {(["limbo", "points", "usdce"] as TabKey[]).map((t) => {
              const active = t === tab;
              const label = t === "usdce" ? "USDC.e" : t[0].toUpperCase() + t.slice(1);
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative -mb-px px-1.5 pb-2 text-sm transition-colors ${
                    active ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full ${
                      active ? "bg-[var(--primary-500)]" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex h-[calc(100%-120px)] flex-col gap-4 overflow-y-auto px-4 pb-6 pt-4">
          {tab === "points" && (
            <>
              {/* summary card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800">
                      <MI name="star" className="text-[18px] text-yellow-400" />
                    </div>
                    <div className="text-sm text-neutral-400">Points</div>
                  </div>
                </div>

                <div className="mt-3 text-3xl font-bold">{fmtPts(points.availablePts)}</div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-neutral-300">
                    Level: <span className="font-medium">{points.level ?? "Bronze"}</span>
                  </div>
                  <div className="text-xs text-neutral-400">Progress to next level</div>
                  <div className="h-2 w-full rounded-full bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-[var(--primary-500)]"
                      style={{ width: `${Math.min(100, Math.max(0, points.progressPct ?? 0))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* mini stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MiniStat
                  title="Portfolio"
                  value={fmtPts(points.portfolioPts)}
                />
                <MiniStat
                  title="Profit/Loss"
                  value={fmtPts(points.pnlPts)}
                />
              </div>

              {/* placeholder last predictions */}
              <section>
                <h4 className="mb-2 text-sm font-semibold text-neutral-50">Last Predictions</h4>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-sm text-neutral-400">
                  No markets found
                </div>
              </section>
            </>
          )}

          {tab === "usdce" && (
            <>
              {/* summary card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800">
                      <MI name="account_balance_wallet" className="text-[18px] text-[var(--primary-500)]" />
                    </div>
                    <div className="text-sm text-neutral-300">USDC</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800">
                      View Portfolio
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary-500)] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
                      <MI name="add" className="text-[18px]" />
                      Fund
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-3xl font-bold">{usdce.availableUsd}</div>

                {usdce.address && (
                  <div className="mt-2 truncate text-xs text-neutral-400">{usdce.address}</div>
                )}
              </div>

              {/* mini stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MiniStat title="Portfolio" value={usdce.portfolioUsd} />
                <MiniStat title="Profit/Loss" value={usdce.pnlUsd} />
              </div>

              <section>
                <h4 className="mb-2 text-sm font-semibold text-neutral-50">Last Predictions</h4>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-sm text-neutral-400">
                  No markets found
                </div>
              </section>
            </>
          )}

          {tab === "limbo" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-neutral-300">
              Limbo tab (placeholder).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
