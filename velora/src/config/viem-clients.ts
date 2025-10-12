// src/config/viem-clients.ts
"use client";

import { createPublicClient, createWalletClient, custom, http } from "viem";
import { publicActionsL2, eip712WalletActions } from "viem/zksync";
import { chain } from "./chain";

const RPC_URL =
  process.env.NEXT_PUBLIC_ABSTRACT_API_URL ||
  (process.env.NEXT_PUBLIC_ABSTRACT_NETWORK === "testnet"
    ? "https://api-sepolia.abs.xyz"
    : "https://api.mainnet.abs.xyz");

// --- Read-only client ---
export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
}).extend(publicActionsL2());

// --- Provider Resolution (prioritise AGW/Privy) ---
function pickEthereumFallback(): any | undefined {
  const w: any = typeof window !== "undefined" ? window : undefined;
  if (!w?.ethereum) return undefined;

  // Jika wallet multiprovider (providerMap/providers), cari yg bernama 'abstract' dulu
  const byMap = w.ethereum?.providerMap?.get?.("abstract");
  if (byMap) return byMap;

  const providers: any[] = w.ethereum?.providers || [];
  const abstractLike =
    providers.find((p: any) => p?.isAbstract || p?.chainId === `0x${chain.id.toString(16)}`) ||
    providers.find((p: any) => p?.session?.chainId === chain.id);

  if (abstractLike) return abstractLike;

  // Final fallback: JANGAN pakai Coinbase kalau AGW ada
  // (kalau kamu benar2 ingin pakai coinbase, hapus filter ini)
  if (w.ethereum?.isCoinbaseWallet) return undefined;

  return w.ethereum;
}

export function getInjectedProvider(): any | undefined {
  if (typeof window === "undefined") return undefined;
  const w: any = window as any;

  // 1) Provider yang disetel Connect Button kita
  if (w.__GLONIC_AGW_PROVIDER__) return w.__GLONIC_AGW_PROVIDER__;

  // 2) Privy AGW
  if (w?.privy?.abstractProvider) return w.privy.abstractProvider;

  // 3) Abstract provider global
  if (w?.abstract?.provider) return w.abstract.provider;

  // 4) Preferensi user
  const pref = (w.localStorage?.getItem?.("glonic:wallet-preferred") || "").toLowerCase();
  if (pref === "agw") {
    // kalau user prefer AGW tapi belum ada, lebih baik return undefined
    // agar kita munculkan error "Connect Abstract Wallet dulu".
    return undefined;
  }

  // 5) Fallback ethereum (hindari coinbase bila mungkin)
  return pickEthereumFallback();
}

export function getWalletClient() {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error(
      "Wallet provider tidak ditemukan. Hubungkan Abstract Wallet (AGW) terlebih dulu."
    );
  }
  return createWalletClient({
    chain,
    transport: custom(provider),
  })
    .extend(eip712WalletActions())
    .extend(publicActionsL2());
}

// Minta alamat + pastikan chain benar
export async function getOrRequestAccount(): Promise<`0x${string}`> {
  const wc = getWalletClient();
  let addrs = await wc.getAddresses();
  if (!addrs?.length) {
    // viem v2
    // @ts-ignore
    addrs = (await wc.requestAddresses?.()) || (await wc.requestAccounts?.());
  }
  if (!addrs?.length) {
    throw new Error("Belum terhubung ke Abstract Wallet. Silakan Connect Wallet.");
  }

  try {
    const cid = await wc.getChainId();
    if (cid !== chain.id) await wc.switchChain({ id: chain.id });
  } catch {
    // abaikan
  }
  return addrs[0]!;
}

/** Dipanggil dari Connect Button setelah AGW sukses connect */
export function rememberAGWProvider(provider: any) {
  if (typeof window === "undefined") return;
  const w: any = window as any;
  if (provider) {
    w.__GLONIC_AGW_PROVIDER__ = provider;
    try { localStorage.setItem("glonic:wallet-preferred", "agw"); } catch {}
  }
}
