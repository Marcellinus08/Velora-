// src/components/payments/TreasuryButtons.tsx
"use client";

import React from "react";
import { Address } from "viem";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";

function notifySuccess(title: string, hash: string) {
  if (typeof window !== "undefined") alert(`${title}\nTx: ${hash}`);
  console.log(title, hash);
}
function notifyError(e: any) {
  const msg = e?.shortMessage || e?.message || "Transaction failed";
  if (typeof window !== "undefined") alert(msg);
  console.error(e);
}

export function BuyVideoButton({
  videoId, creator, priceUsd, className = "", children = "Buy",
}: { videoId: number | string; creator: Address; priceUsd: number | string; className?: string; children?: React.ReactNode; }) {
  const { loading, purchaseVideo } = useGlonicTreasury();
  const onClick = async () => {
    try {
      const tx = await purchaseVideo({ videoId, creator, priceUsd });
      notifySuccess("Purchase success", tx);
    } catch (e) { notifyError(e); }
  };
  return (
    <button disabled={loading} onClick={onClick} className={className}>
      {loading ? "Processing..." : children}
    </button>
  );
}

export function PayAdsButton({
  campaignId, amountUsd, className = "", children = "Proceed to Payment",
}: { campaignId?: number | string; amountUsd: number | string; className?: string; children?: React.ReactNode; }) {
  const { loading, payAds } = useGlonicTreasury();
  const onClick = async () => {
    try {
      const id = (campaignId ?? Math.floor(Date.now() / 1000)) as number | string;
      const tx = await payAds({ campaignId: id, amountUsd });
      notifySuccess("Ads payment success", tx);
    } catch (e) { notifyError(e); }
  };
  return (
    <button disabled={loading} onClick={onClick} className={className}>
      {loading ? "Processing..." : children}
    </button>
  );
}

export function PayMeetButton({
  bookingId, creator, rateUsdPerMin, minutes, className = "", children = "Pay Now",
}: { bookingId: number | string; creator: Address; rateUsdPerMin: number | string; minutes: number; className?: string; children?: React.ReactNode; }) {
  const { loading, payMeet } = useGlonicTreasury();
  const onClick = async () => {
    try {
      const tx = await payMeet({ bookingId, creator, rateUsdPerMin, minutes });
      notifySuccess("Meet payment success", tx);
    } catch (e) { notifyError(e); }
  };
  return (
    <button disabled={loading} onClick={onClick} className={className}>
      {loading ? "Processing..." : children}
    </button>
  );
}
