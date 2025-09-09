// src/components/admin.tsx
"use client";

import React, { useMemo, useState } from "react";

/* =========================
   Reusable section wrapper
========================= */
export function AdminSection({
  title,
  children,
  right,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-50">{title}</h3>
        {right}
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900">{children}</div>
    </section>
  );
}

/* =========================
   Small KPI cards
========================= */
export function StatCard({
  label,
  value,
  diff,
  icon,
}: {
  label: string;
  value: string;
  diff?: string; // e.g. "+8.2%"
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-50">{value}</p>
      {diff && <p className="mt-1 text-xs text-emerald-400">{diff} vs last week</p>}
    </div>
  );
}

/* =========================
   Simple table
========================= */
export function SimpleTable({
  columns,
  rows,
  emptyText = "No data",
}: {
  columns: string[];
  rows: (React.ReactNode[])[];
  emptyText?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-neutral-300">
            {columns.map((c) => (
              <th key={c} className="sticky top-0 z-[1] bg-neutral-900/90 px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-neutral-400" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-neutral-800 text-neutral-200">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
   Tiny bar chart (CSS only)
========================= */
export function TinyBarChart({
  values, // 0..100
  height = 64,
}: {
  values: number[];
  height?: number;
}) {
  const max = 100;
  return (
    <div
      className="flex items-end gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-2"
      style={{ height }}
      aria-label="Mini bar chart"
    >
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 flex-1 rounded-sm bg-[var(--primary-500)]/80"
          style={{ height: `${(v / max) * (height - 16)}px` }}
          aria-hidden
        />
      ))}
    </div>
  );
}

/* =========================
   Filters (client)
========================= */
export function PeriodFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-select rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-50 focus:border-[var(--primary-500)] focus:ring-0"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
    </select>
  );
}

/* =========================
   Mock hooks (demo)
========================= */
export function useKpis(period: string) {
  // hanya demo shuffle angka
  return useMemo(() => {
    const seed = period === "30d" ? 2 : period === "90d" ? 3 : 1;
    const rnd = (n: number) => Math.round(n * (1 + seed / 10));
    return {
      revenue: `$${(rnd(12800)).toLocaleString()}`,
      newUsers: rnd(342).toString(),
      activeSubs: rnd(2189).toLocaleString(),
      tickets: rnd(27).toString(),
      chart: Array.from({ length: 14 }, (_, i) => ((i * 7 + 20) % 100)),
    };
  }, [period]);
}

/* =========================
   Badge helpers
========================= */
export const Pill = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "violet" | "emerald" | "red" }) => {
  const map = {
    neutral: "bg-neutral-800 text-neutral-200",
    violet: "bg-violet-900/30 text-violet-300",
    emerald: "bg-emerald-900/30 text-emerald-300",
    red: "bg-red-900/30 text-red-300",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
};
