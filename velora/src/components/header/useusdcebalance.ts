"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, type Abi } from "viem";
import { getContractWithCurrentChain } from "@/lib/chain-utils";

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

const POLL_MS = 60_000;

export function useUsdceBalance() {
  const { address, status } = useAccount();
  const isConnected = status === "connected" && !!address;
  const client = usePublicClient();
  const [usdceText, setUsdceText] = useState<string>("$0");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refresh() {
    try {
      if (!client || !address) {
        setUsdceText("$0");
        return;
      }
      const usdce = getContractWithCurrentChain("usdce");
      const [dec, bal] = await Promise.all([
        client.readContract({ address: usdce.address as `0x${string}`, abi: ERC20_MIN_ABI, functionName: "decimals" }),
        client.readContract({ address: usdce.address as `0x${string}`, abi: ERC20_MIN_ABI, functionName: "balanceOf", args: [address] }),
      ]);
      const amount = Number(formatUnits(bal as bigint, Number(dec)));
      setUsdceText(formatUSD(amount));
    } catch {
      setUsdceText("$0");
    }
  }

  useEffect(() => {
    void refresh();

    function start() {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (document.visibilityState === "visible") void refresh();
      }, POLL_MS);
    }
    function stop() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, address, isConnected]);

  return usdceText;
}
