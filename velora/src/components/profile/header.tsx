// src/components/profile/header.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { ProfileUser } from "./types";
import { AbstractProfile } from "@/components/abstract-profile";

/* ===== Types dari DB API ===== */
type DbProfile = {
  abstract_id: string;
  username: string | null;
  avatar_url: string | null;
};

const ETH_RE = /^0x[a-f0-9]{40}$/;

/* ===== Utils ===== */
const shortAddr = (addr?: string | null) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "-";

/* SVG placeholder (jaga-jaga kalau semuanya gagal) */
const PLACEHOLDER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
      <rect width='100%' height='100%' fill='#161616'/>
      <circle cx='80' cy='80' r='72' fill='none' stroke='#7c3aed' stroke-width='4' />
      <text x='50%' y='53%' dominant-baseline='middle' text-anchor='middle'
            fill='#777' font-family='sans-serif' font-size='14'>Avatar</text>
    </svg>`
  );

/* ===== Hook: ambil profil dari DB ===== */
function useDbProfile(address?: `0x${string}`) {
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const addrLower = useMemo(
    () => (address ? address.toLowerCase() : ""),
    [address]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!ETH_RE.test(addrLower)) {
        setUsername(null);
        setAvatarUrl(null);
        return;
      }

      try {
        const r = await fetch(`/api/profiles/${addrLower}`, { cache: "no-store" });
        if (!r.ok) {
          setUsername(null);
          setAvatarUrl(null);
          return;
        }
        const p = (await r.json()) as DbProfile;
        if (!alive) return;

        setUsername(p?.username ?? null);
        setAvatarUrl(p?.avatar_url ? `${p.avatar_url}?v=${Date.now()}` : null);
      } catch {
        if (!alive) return;
        setUsername(null);
        setAvatarUrl(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [addrLower]);

  return { username, avatarUrl };
}

/* ===== Component ===== */
export default function ProfileHeader({ user }: { user: ProfileUser }) {
  const { address } = useAccount();

  // 1) Data dari DB
  const { username: dbUsername, avatarUrl: dbAvatar } = useDbProfile(
    address as `0x${string}` | undefined
  );

  // 2) Nama ditampilkan: DB → dummy prop → short wallet
  const displayName =
    dbUsername?.trim() || user?.name || shortAddr(address) || "Velora User";

  // 3) Bio (sementara tetap dari dummy)
  const bio =
    user?.bio ||
    "Content creator and photography enthusiast. Sharing my journey and skills with the world.";

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Avatar: DB → AbstractProfile → placeholder */}
      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
        {dbAvatar ? (
          // Dari DB
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dbAvatar}
            alt={`${displayName} avatar`}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG;
            }}
          />
        ) : address ? (
          // Fallback: avatar dari Abstract (sama seperti di header utama)
          <AbstractProfile
            size="lg"
            showTooltip={false}
            className="!h-24 !w-24 !rounded-full object-cover"
          />
        ) : (
          // Terakhir: placeholder SVG
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={PLACEHOLDER_SVG}
            alt="Avatar placeholder"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="truncate text-2xl font-bold text-neutral-50">
          {displayName}
        </h1>
        <p className="text-sm text-neutral-400">{shortAddr(address)}</p>
      </div>
    </div>
  );
}
