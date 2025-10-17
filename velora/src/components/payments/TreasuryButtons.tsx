// src/components/payments/TreasuryButtons.tsx
"use client";

import { useState } from "react";
import type { Address } from "viem";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";

/* helpers */
function pickMsg(e: unknown) {
  const err = e as any;
  return (
    err?.shortMessage ||
    err?.message ||
    (typeof err === "string" ? err : "Transaction failed")
  );
}
function alertErr(e: unknown) {
  const msg = pickMsg(e);
  if (typeof window !== "undefined") alert(msg);
  console.error(e);
}

/** Generic retry saat init gagal */
async function withInitRetry<T>(
  doIt: () => Promise<T>,
  relogin: () => Promise<void>
): Promise<T> {
  try {
    return await doIt();
  } catch (e) {
    const msg = pickMsg(e);
    if (msg?.toLowerCase().includes("failed to initialize request")) {
      // session/login AGW bisa kedaluwarsa → login lagi lalu retry sekali
      await relogin();
      return await doIt();
    }
    throw e;
  }
}

/* ======================== Buy Video ======================== */
export function BuyVideoButton({
  videoId,
  creator,
  priceUsd,
  disabled,
  className = "",
  children = "Buy",
}: {
  videoId: number | string | bigint;
  creator: Address;
  priceUsd: number | string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { loading, purchaseVideo } = useGlonicTreasury();
  const { login } = useLoginWithAbstract();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (disabled) return;
    setBusy(true);
    try {
      const run = () => purchaseVideo({ videoId, creator, priceUsd });
      const tx = await withInitRetry(run, async () => login());
      alert(`Purchase success\nTx: ${tx}`);
    } catch (e) {
      alertErr(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!!disabled || busy || loading}
      onClick={onClick}
      aria-busy={busy || loading}
      className={className}
    >
      {busy || loading ? "Processing..." : children}
    </button>
  );
}

/* ======================== Pay Ads ======================== */
export function PayAdsButton({
  campaignId,
  amountUsd,
  onPaid,
  disabled,
  className = "",
  children = "Proceed to Payment",
}: {
  campaignId?: number | string | bigint;
  amountUsd: number | string;
  onPaid?: (tx: `0x${string}`) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { loading, payAds } = useGlonicTreasury();
  const { login } = useLoginWithAbstract();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (disabled) return;
    setBusy(true);
    const id =
      campaignId ??
      (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`);

    try {
      const run = () => payAds({ campaignId: id, amountUsd });
      const tx = await withInitRetry(run, async () => login());
      onPaid?.(tx);
      // optional alert: alert(`Ads payment success\nTx: ${tx}`);
    } catch (e) {
      alertErr(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!!disabled || busy || loading}
      onClick={onClick}
      aria-busy={busy || loading}
      className={className}
    >
      {busy || loading ? "Processing..." : children}
    </button>
  );
}

/* ======================== Pay Meet ======================== */
export function PayMeetButton({
  bookingId,
  creator,
  rateUsdPerMin,
  minutes,
  disabled,
  className = "",
  children = "Pay Now",
  onPaid,
}: {
  bookingId: number | string | bigint;
  creator: Address;
  rateUsdPerMin: number | string;
  minutes: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onPaid?: (tx: `0x${string}`) => void;
}) {
  const { loading, payMeet } = useGlonicTreasury();
  const { login } = useLoginWithAbstract();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (disabled) return;
    setBusy(true);
    try {
      const run = () =>
        payMeet({ bookingId, creator, rateUsdPerMin, minutes });
      const tx = await withInitRetry(run, async () => login());
      onPaid?.(tx);
      alert(`Meet payment success\nTx: ${tx}`);
    } catch (e) {
      alertErr(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!!disabled || busy || loading}
      onClick={onClick}
      aria-busy={busy || loading}
      className={className}
    >
      {busy || loading ? "Processing..." : children}
    </button>
  );
}
