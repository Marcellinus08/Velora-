// src/components/payments/PayAdsButton.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGlonicTreasury } from "@/hooks/use-glonic-treasury";

type Props = {
  campaignId?: string | number;       // opsional; auto-generate kalau kosong
  amountUsd: number;                  // total USD
  disabled?: boolean;
  className?: string;
  onPaid?: (txHash: `0x${string}`) => void;
};

export function PayAdsButton({
  campaignId,
  amountUsd,
  disabled,
  className,
  onPaid,
}: Props) {
  const { loading, payAds } = useGlonicTreasury();
  const [err, setErr] = useState<string>("");

  const onClick = async () => {
    if (disabled || loading) return;
    try {
      setErr("");
      const id =
        campaignId ??
        (typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`);

      if (!amountUsd || amountUsd <= 0) throw new Error("Nominal tidak valid.");

      const tx = await payAds({ campaignId: id, amountUsd });
      onPaid?.(tx);
    } catch (e: any) {
      setErr(e?.message || "Payment failed");
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <button
        onClick={onClick}
        disabled={!!disabled || loading || amountUsd <= 0}
        aria-disabled={!!disabled || loading || amountUsd <= 0}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary-500)] px-4 py-2.5",
          "text-sm font-semibold text-white shadow-sm transition hover:bg-opacity-90",
          "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        )}
      >
        {loading ? "Processing…" : "Proceed to Payment"}
      </button>

      {!!err && <p className="mt-2 text-xs text-red-400">{err}</p>}
    </div>
  );
}
