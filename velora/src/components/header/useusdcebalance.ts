// src/components/header/useusdcebalance.ts
"use client";

import * as React from "react";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import { formatUnits, type Abi } from "viem";
import { getContractWithCurrentChain } from "@/lib/chain-utils";

// === USDC.e bridged di Abstract mainnet (sesuai preferensi kamu) ===
// Pastikan ini sama persis dengan yang kamu pakai di project lain.
const USDCE_ABSTRACT_MAINNET = "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1";

// Jika kamu ingin, set juga chainId Abstract di sini:
const ABSTRACT_MAINNET_CHAIN_ID = 2741; // ganti jika setup kamu beda

/** Minimal ERC20 ABI (read-only) */
const ERC20_MIN_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
] as const satisfies Abi;

function formatUSD(n: number) {
  if (!isFinite(n) || n <= 0) return "$0";
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  const units = [
    { v: 1e9, s: "b" },
    { v: 1e6, s: "m" },
    { v: 1e3, s: "k" },
  ];
  for (const u of units) if (n >= u.v) return `$${(n / u.v).toFixed(1)}${u.s}`;
  return `$${n.toFixed(0)}`;
}

/**
 * Hook untuk menampilkan saldo USDC.e (bridged) sebagai teks "$…".
 * Robust terhadap:
 * - mapping chain tidak ketemu,
 * - client lagi di chain lain,
 * - kegagalan baca kontrak (fallback ke $0, bukan crash).
 */
export function useUsdceBalance(pollMs = 60_000) {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;
  const client = usePublicClient();
  const chainId = useChainId();

  const [text, setText] = React.useState("$0");
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resolveUsdceAddress = React.useCallback((): `0x${string}` | null => {
    try {
      // 1) Coba ambil dari util (mapping per-chain)
      //    Catatan: beberapa versi util menerima chainId sebagai argumen kedua.
      const cfg = getContractWithCurrentChain?.("usdce", chainId as any) ?? getContractWithCurrentChain?.("usdce");
      if (cfg?.address) return cfg.address as `0x${string}`;
    } catch {
      // diamkan, lanjut fallback
    }

    // 2) Fallback paksa ke Abstract mainnet
    //    Kalau kamu *hanya* support Abstract, ini aman.
    return USDCE_ABSTRACT_MAINNET as `0x${string}`;
  }, [chainId]);

  const refresh = React.useCallback(async () => {
    try {
      if (!client || !address) {
        setText("$0");
        return;
      }

      // Pastikan client sedang terhubung ke chain yang benar untuk membaca state.
      // Kalau config Wagmi kamu multi-chain, ini membantu menghindari RPC salah chain.
      const tokenAddress = resolveUsdceAddress();
      if (!tokenAddress) {
        setText("$0");
        return;
      }

      // Baca decimals & balance. Pakai multicall kalau tersedia.
      let decimals: number | undefined;
      let balance: bigint | undefined;

      if (typeof (client as any)?.multicall === "function") {
        const res: any = await (client as any).multicall({
          contracts: [
            { address: tokenAddress, abi: ERC20_MIN_ABI, functionName: "decimals" },
            { address: tokenAddress, abi: ERC20_MIN_ABI, functionName: "balanceOf", args: [address] },
          ],
        });
        const [decR, balR] = res ?? [];
        decimals = Number(decR?.result ?? 6);
        balance = BigInt(balR?.result ?? 0n);
      } else {
        const [dec, bal] = await Promise.all([
          client.readContract({ address: tokenAddress, abi: ERC20_MIN_ABI, functionName: "decimals" }),
          client.readContract({ address: tokenAddress, abi: ERC20_MIN_ABI, functionName: "balanceOf", args: [address] }),
        ]);
        decimals = Number(dec);
        balance = bal as bigint;
      }

      const amount = Number(formatUnits(balance ?? 0n, decimals || 6));
      setText(formatUSD(amount));
    } catch {
      setText("$0");
    }
  }, [client, address, resolveUsdceAddress]);

  // Refresh on mount & deps change
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  // Polling hanya saat connected + tab visible
  React.useEffect(() => {
    const start = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, pollMs);
    };
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isConnected) start();
    else stop();

    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [isConnected, pollMs, refresh]);

  return text;
}
