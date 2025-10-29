// src/hooks/use-glonic-treasury.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Address,
  Hex,
  parseUnits,
  isHex,
  keccak256,
  toBytes,
  maxUint256,
} from "viem";
import { useAbstractClient } from "@abstract-foundation/agw-react";

import { chain } from "@/config/chain";
import { publicClient } from "@/config/viem-clients";
import {
  ERC20_ABI,
  TREASURY_ABI,
  TREASURY_ADDRESS,
  USDC_E_ADDRESS,
  USDC_DECIMALS,
} from "@/config/abstract-contracts";

/* == Approve Mode == */
const APPROVE_MODE =
  (process.env.NEXT_PUBLIC_APPROVE_MODE || "infinite").toLowerCase() as
    | "infinite"
    | "exact"
    | "cap";

const APPROVE_CAP_USD = Number(process.env.NEXT_PUBLIC_APPROVE_CAP_USD || 100);

function approveAmountFor(need: bigint): bigint {
  if (APPROVE_MODE === "infinite") return maxUint256;
  if (APPROVE_MODE === "cap") {

    return parseUnits(String(APPROVE_CAP_USD.toFixed(6)), USDC_DECIMALS);
  }
  return need; // exact
}

/* === Helpers === */
function safeNumber(v: number | string | undefined | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Konversi USD ke amount token (bigint) dengan pembulatan aman (6 desimal) */
function toUSDCAmount(usd: number | string): bigint {
  const n = safeNumber(usd);
  // Hindari binary float: tulis dengan fixed 6 desimal → parseUnits
  return parseUnits(n.toFixed(6), USDC_DECIMALS);
}

/** Terima number | bigint | "123" | "0x.." | UUID → uint256 */
function toUint256Id(id: number | string | bigint): bigint {
  if (typeof id === "bigint") return id;
  if (typeof id === "number") return BigInt(id);
  const s = String(id).trim();
  if (/^\d+$/.test(s)) return BigInt(s);
  if (isHex(s as any)) return BigInt(s as `0x${string}`);
  return BigInt(keccak256(toBytes(s)));
}

/* ===================== Hook ===================== */
export function useGlonicTreasury() {
  const [loading, setLoading] = useState(false);
  const { data: agw } = useAbstractClient();

  const requireWallet = useCallback(() => {
    if (!agw) throw new Error("Please sign in with your Abstract Wallet first.");
    if (!agw.account?.address) throw new Error("AGW Wallet is not ready .");
    return agw;
  }, [agw]);

  const getAccount = useCallback(async (): Promise<Address> => {
    const addr = requireWallet().account!.address as Address;
    return addr;
  }, [requireWallet]);

  const ensureBalance = useCallback(
    async (owner: Address, need: bigint) => {
      const bal = (await publicClient.readContract({
        address: USDC_E_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [owner],
      })) as bigint;
      if (bal < need) throw new Error("USDC.e .");
    },
    []
  );

  // Sekali approve (bergantung env)
  const ensureAllowance = useCallback(
    async (owner: Address, spender: Address, need: bigint) => {
      const current = (await publicClient.readContract({
        address: USDC_E_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [owner, spender],
      })) as bigint;

      if (current < need) {
        const w = requireWallet();
        await w.writeContract({
          account: w.account,
          chain,
          address: USDC_E_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, approveAmountFor(need)],
        });
      }
    },
    [requireWallet]
  );

  /** 60/40 video */
  const purchaseVideo = useCallback(
    async ({
      videoId,
      creator,
      priceUsd,
    }: {
      videoId: number | string | bigint;
      creator: Address;
      priceUsd: number | string;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS has not been set.");
      setLoading(true);
      try {
        const w = requireWallet();
        const account = await getAccount();

        const amount = toUSDCAmount(priceUsd);
        const idU256 = toUint256Id(videoId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await w.writeContract({
          account: w.account,
          chain,
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "purchaseVideo",
          args: [idU256, creator, amount],
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [requireWallet, getAccount, ensureAllowance, ensureBalance]
  );

  /** 100% platform (ads) */
  const payAds = useCallback(
    async ({
      campaignId,
      amountUsd,
    }: {
      campaignId: number | string | bigint;
      amountUsd: number | string;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS has not been set.");
      setLoading(true);
      try {
        const w = requireWallet();
        const account = await getAccount();

        const amount = toUSDCAmount(amountUsd);
        const idU256 = toUint256Id(campaignId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await w.writeContract({
          account: w.account,
          chain,
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "payAds",
          args: [idU256, amount],
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [requireWallet, getAccount, ensureAllowance, ensureBalance]
  );

  /** 80/20 meet — kirim TOTAL (kontrak yang membagi) */
  const payMeet = useCallback(
    async ({
      bookingId,
      creator,
      totalUsd,         
      rateUsdPerMin,    
      minutes,          
    }: {
      bookingId: number | string | bigint;
      creator: Address;
      totalUsd?: number | string;
      rateUsdPerMin?: number | string;
      minutes?: number;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS has not been set.");
      setLoading(true);
      try {
        const w = requireWallet();
        const account = await getAccount();

        // Prefer totalUsd, fallback ke rate * minutes 
        let usd = totalUsd != null
          ? safeNumber(totalUsd)
          : safeNumber(rateUsdPerMin) * Math.max(1, Math.ceil(safeNumber(minutes)));

        usd = Number(usd.toFixed(6));
        if (!(usd > 0)) throw new Error("Invalid nominal meet.");

        const amount = toUSDCAmount(usd);
        const idU256 = toUint256Id(bookingId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await w.writeContract({
          account: w.account,
          chain,
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "payMeet",
          args: [idU256, creator, amount],
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [requireWallet, getAccount, ensureAllowance, ensureBalance]
  );

  return useMemo(
    () => ({ loading, purchaseVideo, payAds, payMeet }),
    [loading, purchaseVideo, payAds, payMeet]
  );
}
