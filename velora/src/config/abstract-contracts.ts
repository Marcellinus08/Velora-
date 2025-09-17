// src/config/abstract-contracts.ts
import type { ContractsConfig } from "@/types/contracts";
import type { Address, Abi } from "viem";

/* ---------------- ERC20 minimal ABI (untuk baca saldo/decimals) --------------- */
export const ERC20_ABI = [
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
] as const satisfies Abi;

/* ---------------- ABIs lain kamu (WETH9, USDC proxy, USDT proxy, Uniswap, dst) --------------- */
/*  KAMU BOLEH PERTAHANKAN persis dari file lama. Disingkat di sini agar tidak panjang.
    Contoh:
    export const WETH9_ABI = [ ... ] as const;
    export const UNISWAP_V2_FACTORY_ABI = [ ... ] as const;
    export const UNISWAP_V2_ROUTER_ABI = [ ... ] as const;
    export const UNISWAP_V3_FACTORY_ABI = [ ... ] as const;
    export const QUOTER_V2_ABI = [ ... ] as const;
    export const SWAP_ROUTER_02_ABI = [ ... ] as const;
*/

/* ---------------- Konfigurasi kontrak ---------------- */
export const ABSTRACT_CONTRACTS: ContractsConfig = {
  tokens: {
    /* Token lama kamu biarkan saja (weth/usdc/usdt).
       usdc/usdt bisa tetap pakai ABI yg kamu punya.
       Untuk baca SALDO di header, kita akan pakai usdce + ERC20_ABI. */
    weth: {
      name: "Wrapped Ether",
      description: "WETH9 - Wrapped Ether contract for Abstract",
      addresses: {
        mainnet: "0x3439153EB7AF838Ad19d56E1571FBD09333C2809",
        testnet: "0x9EDCde0257F2386Ce177C3a7FCdd97787F0D841d",
      } as const,
      // abi: WETH9_ABI,  // aktifkan jika kamu menyertakan WETH9_ABI di atas
    },

    usdc: {
      name: "USD Coin",
      description: "USDC - Circle's stablecoin on Abstract",
      addresses: {
        mainnet: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
        testnet: "0xe4C7fBB0a626ed208021ccabA6Be1566905E2dFc",
      } as const,
      // abi: ERC20_ABI  // boleh pakai ERC20_ABI kalau mau read-only
    },

    usdt: {
      name: "Tether USD",
      description: "USDT - Tether's stablecoin on Abstract",
      addresses: {
        mainnet: "0x0709F39376dEEe2A2dfC94A58EdEb2Eb9DF012bD",
        // testnet: tidak tersedia
      } as const,
      // abi: ERC20_ABI
    },

    /* >>> Tambahan penting: USDC.e (bridged) <<< */
    usdce: {
      name: "USD Coin (Bridged)",
      description: "USDC.e on Abstract",
      addresses: {
        // Isi via ENV supaya aman & gampang ganti
        mainnet: (process.env.NEXT_PUBLIC_ABSTRACT_USDCE_MAINNET as Address) || undefined,
        testnet: (process.env.NEXT_PUBLIC_ABSTRACT_USDCE_TESTNET as Address) || undefined,
      } as const,
      abi: ERC20_ABI,
    },
  },

  dex: {
    // biarkan router/factory yang sudah kamu punya:
    // uniswapV2Factory, uniswapV2Router, uniswapV3Factory, quoterV2, swapRouter02
    // contoh singkat (alamat kamu sebelumnya):
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

// Re-export abi yang kamu butuh di tempat lain (opsional)
export {
  // WETH9_ABI,
  // UNISWAP_V2_FACTORY_ABI,
  // UNISWAP_V2_ROUTER_ABI,
  // UNISWAP_V3_FACTORY_ABI,
  // QUOTER_V2_ABI,
  // SWAP_ROUTER_02_ABI,
};
