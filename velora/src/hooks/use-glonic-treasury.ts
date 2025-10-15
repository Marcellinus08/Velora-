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
} from "viem";
import { useAbstractClient } from "@abstract-foundation/agw-react";

import { chain } from "@/config/chain";
import { publicClient } from "@/config/viem-clients";
import {
  ERC20_ABI,
  TREASURY_ABI,
  TREASURY_ADDRESS,
  USDC_E_ADDRESS,
} from "@/config/abstract-contracts";

const USDC_DECIMALS = 6 as const;

/** Terima number | bigint | "123" | "0x.." | UUID → kembalikan bigint uint256 */
function toUint256Id(id: number | string | bigint): bigint {
  if (typeof id === "bigint") return id;
  if (typeof id === "number") return BigInt(id);

  const s = String(id).trim();
  // angka desimal murni
  if (/^\d+$/.test(s)) return BigInt(s);
  // hex (0x...) → bisa langsung ke BigInt
  if (isHex(s as any)) return BigInt(s as `0x${string}`);
  // UUID / string lain → hash ke 32 byte, lalu parse sebagai BigInt
  const h = keccak256(toBytes(s)); // 0x....
  return BigInt(h);
}

export function useGlonicTreasury() {
  const [loading, setLoading] = useState(false);
  const { data: agw } = useAbstractClient(); // sumber wallet AGW

  const getAccount = useCallback(async (): Promise<Address> => {
    const addr = agw?.account?.address as Address | undefined;
    if (!addr) throw new Error("Tidak ada account aktif (AGW belum login).");
    return addr;
  }, [agw]);

  const ensureBalance = useCallback(
    async (owner: Address, need: bigint) => {
      const bal = (await publicClient.readContract({
        address: USDC_E_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [owner],
      })) as bigint;
      if (bal < need) throw new Error("Saldo USDC.e tidak cukup.");
    },
    []
  );

  const ensureAllowance = useCallback(
    async (owner: Address, spender: Address, need: bigint) => {
      const current = (await publicClient.readContract({
        address: USDC_E_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [owner, spender],
      })) as bigint;

      if (current < need) {
        if (!agw) throw new Error("Wallet belum siap. Silakan Sign In AGW.");
        await agw.writeContract({
          address: USDC_E_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, need],
          account: agw.account,
          chain,
        });
      }
    },
    [agw]
  );

  /** 60/40 video */
  const purchaseVideo = useCallback(
    async ({
      videoId,
      creator,
      priceUsd,
    }: {
      videoId: number | string | bigint; // ← boleh UUID
      creator: Address;
      priceUsd: number | string;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
      if (!agw) throw new Error("Silakan Sign In dengan Abstract Wallet dulu.");

      setLoading(true);
      try {
        const account = await getAccount();
        const amount = parseUnits(String(priceUsd), USDC_DECIMALS);
        const idU256 = toUint256Id(videoId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await agw.writeContract({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "purchaseVideo",
          args: [idU256, creator, amount],
          account: agw.account,
          chain,
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [agw, getAccount, ensureAllowance, ensureBalance]
  );

  /** 100% platform (ads) */
  const payAds = useCallback(
    async ({
      campaignId,
      amountUsd,
    }: {
      campaignId: number | string | bigint; // ← boleh UUID
      amountUsd: number | string;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
      if (!agw) throw new Error("Silakan Sign In dengan Abstract Wallet dulu.");

      setLoading(true);
      try {
        const account = await getAccount();
        const amount = parseUnits(String(amountUsd), USDC_DECIMALS);
        const idU256 = toUint256Id(campaignId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await agw.writeContract({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "payAds",
          args: [idU256, amount],
          account: agw.account,
          chain,
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [agw, getAccount, ensureAllowance, ensureBalance]
  );

  /** 80/20 meet */
  const payMeet = useCallback(
    async ({
      bookingId,
      creator,
      rateUsdPerMin,
      minutes,
    }: {
      bookingId: number | string | bigint; // ← boleh UUID
      creator: Address;
      rateUsdPerMin: number | string;
      minutes: number;
    }): Promise<Hex> => {
      if (!TREASURY_ADDRESS) throw new Error("TREASURY_ADDRESS belum diset.");
      if (!agw) throw new Error("Silakan Sign In dengan Abstract Wallet dulu.");

      setLoading(true);
      try {
        const account = await getAccount();
        const mins = Math.max(1, Math.ceil(Number(minutes)));
        const totalUsd = Number(rateUsdPerMin) * mins;
        const amount = parseUnits(String(totalUsd), USDC_DECIMALS);
        const idU256 = toUint256Id(bookingId);

        await ensureBalance(account, amount);
        await ensureAllowance(account, TREASURY_ADDRESS, amount);

        const hash = await agw.writeContract({
          address: TREASURY_ADDRESS,
          abi: TREASURY_ABI,
          functionName: "payMeet",
          args: [idU256, creator, amount],
          account: agw.account,
          chain,
        });
        return hash;
      } finally {
        setLoading(false);
      }
    },
    [agw, getAccount, ensureAllowance, ensureBalance]
  );

  return useMemo(
    () => ({ loading, purchaseVideo, payAds, payMeet }),
    [loading, purchaseVideo, payAds, payMeet]
  );
}
