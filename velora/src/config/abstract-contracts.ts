// src/config/abstract-contracts.ts
import type { ContractsConfig } from "@/types/contracts";
import type { Address, Abi } from "viem";

/* =====================================================================
 * ERC20 minimal ABI (lengkap untuk read + approve/transferFrom flow)
 * =================================================================== */
export const ERC20_ABI = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const satisfies Abi;

/* =====================================================================
 * ABI - GlonicTreasuryV2 (sesuai kode yang kamu kirim)
 * purchaseVideo(videoId, creator, price)
 * payMeet(bookingId, creator, price)
 * payAds(campaignId, amount)
 * =================================================================== */
export const TREASURY_ABI: Abi = [
  {
    type: "function",
    name: "purchaseVideo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "videoId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "payMeet",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bookingId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "payAds",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
];

/* =====================================================================
 * Helper ENV & Network
 * =================================================================== */
const NET = (process.env.NEXT_PUBLIC_ABSTRACT_NETWORK || "mainnet").toLowerCase();
const IS_MAINNET = NET !== "testnet";

/** Baca alamat dari ENV (mendukung nama lama & baru), lalu fallback default */
function pickEnvAddress(
  primaryVar: string | undefined,
  legacyVar?: string | undefined,
  fallbackMainnet?: string,
  fallbackTestnet?: string
): Address | undefined {
  const v = (primaryVar || legacyVar)?.trim();
  if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v as Address;
  if (IS_MAINNET && fallbackMainnet) return fallbackMainnet as Address;
  if (!IS_MAINNET && fallbackTestnet) return fallbackTestnet as Address;
  return undefined;
}

/* =====================================================================
 * Alamat yang dipakai langsung oleh hook transaksi
 * - USDC_E_ADDRESS: USDC.e bridged di Abstract (6 desimal)
 * - TREASURY_ADDRESS: alamat kontrak GlonicTreasuryV2
 * - PLATFORM_ADDRESS: opsional, hanya untuk tampilan UI
 * =================================================================== */
export const USDC_E_ADDRESS: Address = pickEnvAddress(
  process.env.NEXT_PUBLIC_USDC_E_ADDRESS,            // nama baru (direkomendasikan)
  process.env.NEXT_PUBLIC_USDC_ADDR,                 // back-compat (nama lama)
  // fallback default:
  "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",      // mainnet
  "0xe4C7fBB0a626ed208021ccabA6Be1566905E2dFc"       // testnet
)!;

export const TREASURY_ADDRESS: Address = pickEnvAddress(
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS,          // nama baru (direkomendasikan)
  process.env.NEXT_PUBLIC_PLATFORM_TREASURY_ADDR     // back-compat (nama lama)
)!;

export const PLATFORM_ADDRESS: Address | undefined = pickEnvAddress(
  process.env.NEXT_PUBLIC_PLATFORM_ADDR               // opsional (UI)
);

/* =====================================================================
 * Konfigurasi kontrak lain (tetap seperti punyamu)
 * =================================================================== */
export const ABSTRACT_CONTRACTS: ContractsConfig = {
  tokens: {
    weth: {
      name: "Wrapped Ether",
      description: "WETH9 - Wrapped Ether contract for Abstract",
      addresses: {
        mainnet: "0x3439153EB7AF838Ad19d56E1571FBD09333C2809",
        testnet: "0x9EDCde0257F2386Ce177C3a7FCdd97787F0D841d",
      } as const,
      // abi: WETH9_ABI,
    },

    /** Catatan: alamat ini adalah USDC bridged (USDC.e) pada Abstract mainnet */
    usdc: {
      name: "USD Coin",
      description: "USDC - Circle's stablecoin on Abstract",
      addresses: {
        mainnet: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        testnet: "0xe4C7fBB0a626ed208021ccabA6Be1566905E2dFc",
      } as const,
      // abi: ERC20_ABI
    },

    usdt: {
      name: "Tether USD",
      description: "USDT - Tether's stablecoin on Abstract",
      addresses: {
        mainnet: "0x0709F39376dEEe2A2dfC94A58EdEb2Eb9DF012bD",
      } as const,
      // abi: ERC20_ABI
    },

    /** Alias eksplisit untuk USDC.e bila kamu ingin memakainya khusus */
    usdce: {
      name: "USD Coin (Bridged)",
      description: "USDC.e on Abstract",
      addresses: {
        mainnet:
          (process.env.NEXT_PUBLIC_ABSTRACT_USDCE_MAINNET as Address) ||
          ("0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1" as Address),
        testnet:
          (process.env.NEXT_PUBLIC_ABSTRACT_USDCE_TESTNET as Address) ||
          ("0xe4C7fBB0a626ed208021ccabA6Be1566905E2dFc" as Address),
      } as const,
      abi: ERC20_ABI,
    },
  },

  dex: {
    uniswapV2Factory: {
      name: "Uniswap V2 Factory",
      description: "Factory contract for creating Uniswap V2 pairs",
      addresses: {
        mainnet: "0x566d7510dEE58360a64C9827257cF6D0Dc43985E",
        testnet: "0x566d7510dEE58360a64C9827257cF6D0Dc43985E",
      } as const,
      // abi: UNISWAP_V2_FACTORY_ABI,
    },
    uniswapV2Router: {
      name: "Uniswap V2 Router02",
      description: "Router contract for Uniswap V2 swaps and liquidity",
      addresses: {
        mainnet: "0xad1eCa41E6F772bE3cb5A48A6141f9bcc1AF9F7c",
        testnet: "0x96ff7D9dbf52FdcAe79157d3b249282c7FABd409",
      } as const,
      // abi: UNISWAP_V2_ROUTER_ABI,
    },
    uniswapV3Factory: {
      name: "Uniswap V3 Factory",
      description: "Factory contract for creating Uniswap V3 pools",
      addresses: {
        mainnet: "0xA1160e73B63F322ae88cC2d8E700833e71D0b2a1",
        testnet: "0x2E17FF9b877661bDFEF8879a4B31665157a960F0",
      } as const,
      // abi: UNISWAP_V3_FACTORY_ABI,
    },
    quoterV2: {
      name: "Quoter V2",
      description: "Uniswap V3 quoter for getting swap quotes",
      addresses: {
        mainnet: "0x728BD3eC25D5EDBafebB84F3d67367Cd9EBC7693",
        testnet: "0xdE41045eb15C8352413199f35d6d1A32803DaaE2",
      } as const,
      // abi: QUOTER_V2_ABI,
    },
    swapRouter02: {
      name: "Swap Router 02",
      description: "Uniswap V3 router for executing swaps",
      addresses: {
        mainnet: "0x7712FA47387542819d4E35A23f8116C90C18767C",
        testnet: "0xb9D4347d129a83cBC40499Cd4fF223dE172a70dF",
      } as const,
      // abi: SWAP_ROUTER_02_ABI,
    },
  },
};

/* =====================================================================
 * Export util alamat biar gampang diimport di tempat lain
 * =================================================================== */
export const ADDRESSES = {
  USDC_E_ADDRESS,
  TREASURY_ADDRESS,
  PLATFORM_ADDRESS,
} as const;

// Re-export ABI lain (kalau kamu punya) — optional
export {
  // WETH9_ABI,
  // UNISWAP_V2_FACTORY_ABI,
  // UNISWAP_V2_ROUTER_ABI,
  // UNISWAP_V3_FACTORY_ABI,
  // QUOTER_V2_ABI,
  // SWAP_ROUTER_02_ABI,
};
