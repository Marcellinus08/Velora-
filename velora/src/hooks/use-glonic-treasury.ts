// src/hooks/use-glonic-treasury.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { Address, Hex, parseUnits } from "viem";
import { getWalletClient, publicClient, getOrRequestAccount } from "@/config/viem-clients";
import { ERC20_ABI, TREASURY_ABI, TREASURY_ADDRESS, USDC_E_ADDRESS } from "@/config/abstract-contracts";

const USDC_DECIMALS = 6 as const;

async function getAccount(): Promise<Address> {
  return (await getOrRequestAccount()) as Address;
}

export function useGlonicTreasury() {
  const [loading, setLoading] = useState(false);

  const ensureBalance = useCallback(async (owner: Address, need: bigint) => {
    const bal = (await publicClient.readContract({
      address: USDC_E_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [owner],
    })) as bigint;
    if (bal < need) throw new Error("Saldo USDC.e tidak cukup.");
  }, []);

  const ensureAllowance = useCallback(async (owner: Address, spender: Address, need: bigint) => {
    const current = (await publicClient.readContract({
      address: USDC_E_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    })) as bigint;
    if (current < need) {
      const wc = getWalletClient(); // ini sudah AGW
      await wc.writeContract({
        account: owner,
        address: USDC_E_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, need],
      });
    }
  }, []);

  const purchaseVideo = useCallback(async ({
    videoId, creator, priceUsd,
  }: { videoId: number | string; creator: Address; priceUsd: number | string; }): Promise<Hex> => {
    if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
    setLoading(true);
    try {
      const account = await getAccount();
      const amount = parseUnits(String(priceUsd), USDC_DECIMALS);
      await ensureBalance(account, amount);
      await ensureAllowance(account, TREASURY_ADDRESS, amount);
      const wc = getWalletClient();
      return await wc.writeContract({
        account,
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "purchaseVideo",
        args: [BigInt(videoId), creator, amount],
      });
    } finally { setLoading(false); }
  }, [ensureAllowance, ensureBalance]);

  const payAds = useCallback(async ({
    campaignId, amountUsd,
  }: { campaignId: number | string; amountUsd: number | string; }): Promise<Hex> => {
    if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
    setLoading(true);
    try {
      const account = await getAccount();
      const amount = parseUnits(String(amountUsd), USDC_DECIMALS);
      await ensureBalance(account, amount);
      await ensureAllowance(account, TREASURY_ADDRESS, amount);
      const wc = getWalletClient();
      return await wc.writeContract({
        account,
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "payAds",
        args: [BigInt(campaignId), amount],
      });
    } finally { setLoading(false); }
  }, [ensureAllowance, ensureBalance]);

  const payMeet = useCallback(async ({
    bookingId, creator, rateUsdPerMin, minutes,
  }: { bookingId: number | string; creator: Address; rateUsdPerMin: number | string; minutes: number; }): Promise<Hex> => {
    if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
    setLoading(true);
    try {
      const account = await getAccount();
      const mins = Math.max(1, Math.ceil(Number(minutes)));
      const totalUsd = Number(rateUsdPerMin) * mins;
      const amount = parseUnits(String(totalUsd), USDC_DECIMALS);
      await ensureBalance(account, amount);
      await ensureAllowance(account, TREASURY_ADDRESS, amount);
      const wc = getWalletClient();
      return await wc.writeContract({
        account,
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "payMeet",
        args: [BigInt(bookingId), creator, amount],
      });
    } finally { setLoading(false); }
  }, [ensureAllowance, ensureBalance]);

  return useMemo(() => ({ loading, purchaseVideo, payAds, payMeet }), [loading, purchaseVideo, payAds, payMeet]);
}
