"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

/**
 * Panggil /api/profiles/upsert setiap kali user berhasil terkoneksi.
 * De-dup hanya pakai ref agar tidak dipanggil berulang di render yang sama.
 */
export function useCreateProfileOnLogin() {
  const { address, status } = useAccount();
  const lastCalled = useRef<string | null>(null);

  useEffect(() => {
    // Hanya jalan jika sudah "connected" dan ada address
    if (status !== "connected" || !address) return;

    // Hindari multiple-call di render yang sama
    if (lastCalled.current === address) return;
    lastCalled.current = address;

    (async () => {
      try {
        console.log("[upsert] POST /api/profiles/upsert", address);
        const res = await fetch("/api/profiles/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractId: address }),
        });

        if (!res.ok) {
          const msg = await res.text();
          console.error("[upsert] failed:", res.status, msg);
        } else {
          console.log("[upsert] success");
        }
      } catch (err) {
        console.error("[upsert] error:", err);
      }
    })();
  }, [status, address]);
}
