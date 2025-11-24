"use client";

import React from "react";
import Link from "next/link";
import { MI } from "./MI";

/** ---------- Generic Modal (overlay + panel) ---------- */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 720,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  title: string;
}) {
  return (
    <div
      className={`fixed inset-0 z-[90] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* panel */}
      <div
        className={`absolute left-1/2 top-6 w-[92vw] max-w-[${maxWidth}px] -translate-x-1/2 rounded-2xl border border-neutral-800 bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-neutral-900/80 transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800">
              <MI name={title === "Points" ? "star" : "account_balance_wallet"} className="text-[18px] text-[var(--primary-500)]" />
            </span>
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <MI name="close" className="text-[18px]" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/** ---------- Small stat card ---------- */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-xs font-medium tracking-wide text-neutral-400">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-400">{sub}</div> : null}
    </div>
  );
}

/** ---------- Token badge ---------- */
function TokenBadge({
  icon,
  name,
  amount,
  right,
}: {
  icon: React.ReactNode;
  name: string;
  amount: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-white/5 to-transparent p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-800">{icon}</div>
          <div>
            <div className="text-sm text-neutral-300">{name}</div>
            <div className="text-2xl font-bold">{amount}</div>
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

/** ---------- Progress bar ---------- */
function Progress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full rounded-full bg-neutral-800">
      <div
        className="h-2 rounded-full bg-[var(--primary-500)]"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/** ---------- POINTS SHEET ---------- */
export function PointsSheet({
  open,
  onClose,
  points = 0,
}: {
  open: boolean;
  onClose: () => void;
  points?: number;
}) {
  const nf = new Intl.NumberFormat("en-US");

  return (
    <Modal open={open} onClose={onClose} title="Points" maxWidth={720}>
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        {/* Hero */}
        <TokenBadge
          icon={<MI name="star" className="text-[18px] text-yellow-400" />}
          name="Points"
          amount={`${nf.format(points)} pts`}
          right={
            <Link 
              href="/profile"
              onClick={onClose}
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              View Portfolio
            </Link>
          }
        />
      </div>
    </Modal>
  );
}

/** ---------- WALLET SHEET (USDC.e) ---------- */
export function WalletSheet({
  open,
  onClose,
  balanceText = "$0",
  totalSpentUsd = 0,
  totalPurchases = 0,
}: {
  open: boolean;
  onClose: () => void;
  balanceText?: string; // "$5.03" (kamu sudah punya helpernya: useUsdceBalance)
  totalSpentUsd?: number;
  totalPurchases?: number;
}) {
  const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

  return (
    <Modal open={open} onClose={onClose} title="Wallet">
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <TokenBadge
          icon={
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--primary-500)]/20 border border-[var(--primary-500)]/40 text-[var(--primary-500)] text-[13px] font-semibold">
              G
            </span>
          }
          name="USDC.e"
          amount={balanceText}
          right={
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                onClick={onClose}
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                View portfolio
              </Link>
              <button className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary-500)] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
                <MI name="add" className="text-[18px]" />
                Fund
              </button>
            </div>
          }
        />

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Total Spent" value={`$${nf.format(totalSpentUsd)}`} />
          <StatCard label="Total Purchases" value={totalPurchases.toString()} />
        </div>
      </div>
    </Modal>
  );
}
