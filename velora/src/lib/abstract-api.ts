// src/lib/abstract-api.ts
import type {
  AbstractRpcRequest,
  AbstractRpcResponse,
  OptimisticTransactionResponse,
} from "@/types/optimistic-transactions";
import { chain } from "@/config/chain";

// Pakai ENV kalau ada, fallback ke chain id (2741 mainnet, 11124 testnet)
export const ABSTRACT_API_URL =
  process.env.NEXT_PUBLIC_ABSTRACT_API_URL ??
  (chain.id === 2741
    ? "https://api.mainnet.abs.xyz"
    : "https://api.testnet.abs.xyz");

export async function sendRawTransactionWithDetailedOutput(
  signedTransaction: `0x${string}`
): Promise<OptimisticTransactionResponse> {
  const request: AbstractRpcRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "unstable_sendRawTransactionWithDetailedOutput",
    params: [signedTransaction],
  };

  const resp = await fetch(ABSTRACT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

  const data: AbstractRpcResponse = await resp.json();

  if (data.error) {
    const msg = data.error.message || "";
    let friendly =
      msg.includes("insufficient funds") ? "ETH balance too low." :
      msg.includes("known transaction") || msg.includes("nonce too low") ? "Nonce issue. Please refresh." :
      msg.includes("gas required exceeds allowance") ? "Gas issue. Please refresh." :
      msg.includes("replacement transaction underpriced") ? "Gas issue. Please refresh." :
      msg.includes("max fee per gas less than block base fee") ? "Transaction fee too low for current network conditions" :
      `Transaction failed (Error: ${msg})`;
    throw new Error(friendly);
  }

  if (!data.result?.transactionHash) {
    throw new Error("No tx hash returned. Please try again.");
  }

  return data.result;
}
