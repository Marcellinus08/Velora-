"use client";

import { useState } from "react";
import type { Address } from "viem";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { ConnectWalletDialog } from "@/components/ui/connect-wallet-dialog";
import { toast } from "@/components/ui/toast";

/* helpers */
function pickMsg(e: unknown) {
  const err = e as any;
  return (
    err?.shortMessage ||
    err?.message ||
    (typeof err === "string" ? err : "Transaction failed")
  );
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
    if (String(msg || "").toLowerCase().includes("failed to initialize request")) {
      await relogin();      // session AGW kedaluwarsa → login ulang
      return await doIt();  // retry sekali
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
  onSuccess,
}: {
  videoId: number | string | bigint;
  creator: Address;
  priceUsd: number | string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: (tx: `0x${string}`) => void;
}) {
  const { loading, purchaseVideo } = useGlonicTreasury();
  const { login } = useLoginWithAbstract();
  const { address, isConnected } = useAccount();
  const [busy, setBusy] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const onClick = async () => {
    console.log('🔘 Unlock Now button clicked!');
    console.log('🔐 Wallet connected:', isConnected);
    console.log('💰 Price USD:', priceUsd);
    console.log('👤 Creator:', creator);
    console.log('🎥 Video ID:', videoId);
    
    // Check if wallet is connected
    if (!isConnected) {
      console.log('❌ Wallet not connected, showing dialog...');
      setShowConnectDialog(true);
      return;
    }

    if (disabled) {
      console.log('⛔ Button is disabled');
      return;
    }
    
    console.log('✅ Starting purchase process...');
    setBusy(true);
    try {
      const run = () => purchaseVideo({ videoId, creator, priceUsd });
      console.log('📞 Calling purchaseVideo...');
      const tx = await withInitRetry(run, async () => login());

      // Rekam pembelian ke DB
      try {
        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer: (address || "").toLowerCase(),
            videoId: String(videoId),
            priceUsd: Number(priceUsd),
            tx,
            currency: "USD",
          }),
        });
      } catch (err) {
        // jangan block UX kalau logging gagal
        console.warn("record purchase failed:", err);
      }

      toast.success(
        "Purchase Successful!",
        `Transaction: ${tx.slice(0, 10)}...${tx.slice(-8)}\nVideo unlocked and ready to watch`,
        6000
      );

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(tx);
      }
    } catch (e) {
      const msg = pickMsg(e);
      toast.error(
        "Purchase Failed",
        msg,
        5000
      );
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={!!disabled || busy || loading}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🖱️ BuyVideoButton onClick triggered');
          onClick();
        }}
        aria-busy={busy || loading}
        className={`${className} cursor-pointer`}
      >
        {busy || loading ? "Processing..." : children}
      </button>
      <ConnectWalletDialog open={showConnectDialog} onOpenChange={setShowConnectDialog} />
    </>
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
  const { isConnected } = useAccount();
  const [busy, setBusy] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const onClick = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      setShowConnectDialog(true);
      return;
    }

    if (disabled) return;
    setBusy(true);
    const id =
      campaignId ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`);

    try {
      const run = () => payAds({ campaignId: id, amountUsd });
      const tx = await withInitRetry(run, async () => login());
      onPaid?.(tx);
      toast.success(
        "Ad Payment Successful!",
        `Transaction: ${tx.slice(0, 10)}...${tx.slice(-8)}\nYour campaign is now active`,
        6000
      );
    } catch (e) {
      const msg = pickMsg(e);
      toast.error(
        "Payment Failed",
        msg,
        5000
      );
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={!!disabled || busy || loading}
        onClick={onClick}
        aria-busy={busy || loading}
        className={className}
      >
        {busy || loading ? "Processing..." : children}
      </button>
      <ConnectWalletDialog open={showConnectDialog} onOpenChange={setShowConnectDialog} />
    </>
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
  const { isConnected } = useAccount();
  const [busy, setBusy] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  const onClick = async () => {
    // Check if wallet is connected
    if (!isConnected) {
      setShowConnectDialog(true);
      return;
    }

    if (disabled) return;
    setBusy(true);
    try {
      const run = () => payMeet({ bookingId, creator, rateUsdPerMin, minutes });
      const tx = await withInitRetry(run, async () => login());
      onPaid?.(tx);
      toast.success(
        "Meeting Payment Successful!",
        `Transaction: ${tx.slice(0, 10)}...${tx.slice(-8)}\nBooking confirmed - ${minutes} minutes`,
        6000
      );
    } catch (e) {
      const msg = pickMsg(e);
      toast.error(
        "Payment Failed",
        msg,
        5000
      );
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={!!disabled || busy || loading}
        onClick={onClick}
        aria-busy={busy || loading}
        className={className}
      >
        {busy || loading ? "Processing..." : children}
      </button>
      <ConnectWalletDialog open={showConnectDialog} onOpenChange={setShowConnectDialog} />
    </>
  );
}
