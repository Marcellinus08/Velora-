// src/lib/wallet-session.ts
"use client";

/**
 * Ambil alamat wallet aktif dari localStorage.
 * Mengembalikan string 0x... atau null kalau tidak ketemu.
 */
export function getSessionAddress(): `0x${string}` | null {
  try {
    // 1) cek beberapa key umum yg sering dipakai app
    const directKeys = [
      "glonic:abstract_id",
      "abstract_id",
      "abstract:address",
      "wallet_address",
      "selected_account",
    ];
    for (const k of directKeys) {
      const v = localStorage.getItem(k);
      if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v as `0x${string}`;
    }

    // 2) scan semua value di localStorage, extract pola 0x...40
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      const raw = localStorage.getItem(k) || "";
      const m = raw.match(/0x[a-fA-F0-9]{40}/);
      if (m) return m[0] as `0x${string}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}
