// src/hooks/use-sync-profile-on-login.ts
"use client";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

/**
 * Ketika wallet connected dan cookie abs_sess ada,
 * panggil /api/profiles/upsert sekali per sesi browser.
 */
export function useSyncProfileOnLogin() {
  const { address, status } = useAccount();
  const calledRef = useRef<string | null>(null);

  useEffect(() => {
    // cek cookie abs_sess
    const hasAbsCookie = typeof document !== "undefined"
      ? document.cookie.includes("abs_sess=")
      : false;

    if (status !== "connected" || !address || !hasAbsCookie) return;

    // hindari double-call karena re-render
    if (calledRef.current === address) return;

    // hindari pemanggilan berulang dalam 1 sesi browser
    const sessionKey = `profiles:upsert:${address.toLowerCase()}`;
    if (sessionStorage.getItem(sessionKey)) return;

    (async () => {
      try {
        // ✅ SAVE address to localStorage immediately (for NotificationsMenu)
        const lowerAddr = address.toLowerCase();
        if (typeof window !== "undefined") {
          localStorage.setItem("abstract_id", lowerAddr);
          console.log("[useSyncProfileOnLogin] 💾 Saved abstract_id to localStorage:", lowerAddr);
        }

        const res = await fetch("/api/profiles/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractId: address }),
        });
        if (!res.ok) {
          console.error("[profiles/upsert] status:", res.status, await res.text());
        } else {
          sessionStorage.setItem(sessionKey, "1");
          calledRef.current = address;
          console.log("[profiles/upsert] synced");
        }
      } catch (e) {
        console.error("[profiles/upsert] failed:", e);
      }
    })();
  }, [address, status]);
}
