// src/components/profile/header.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  const addrLower = useMemo(
    () => (address ? address.toLowerCase() : ""),
    [address]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!ETH_RE.test(addrLower)) {
        if (alive) {
          setUsername(null);
          setAvatarUrl(null);
          setLoading(false);
        }
        return;
      }

      try {
        const r = await fetch(`/api/profiles/${addrLower}`, { cache: "no-store" });
        if (!r.ok) {
          if (alive) {
            setUsername(null);
            setAvatarUrl(null);
          }
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
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [addrLower]);

  return { username, avatarUrl, loading };
}

/* ===== Component ===== */
export default function ProfileHeader({ 
  user, 
  address 
}: { 
  user: ProfileUser; 
  address?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  // 1) Data dari DB menggunakan address dari props
  const { username: dbUsername, avatarUrl: dbAvatar, loading: dbLoading } = useDbProfile(
    address as `0x${string}` | undefined
  );

  // 2) Nama ditampilkan: DB → short wallet (tidak gunakan dummy name)
  const displayName =
    dbUsername?.trim() || shortAddr(address) || "Velora User";

  // 3) Bio (sementara tetap dari dummy)
  const bio =
    user?.bio ||
    "Content creator and photography enthusiast. Sharing my journey and skills with the world.";

  // Copy address function
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl max-sm:rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 max-sm:p-4 flex flex-col md:flex-row items-start md:items-center gap-6 max-sm:gap-4">
      {/* Avatar: Show skeleton while loading, then DB avatar, then AbstractProfile, then placeholder */}
      <div className="relative h-24 w-24 max-sm:h-20 max-sm:w-20 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)] max-sm:mx-auto md:mx-0">
        {dbLoading ? (
          // Loading: show skeleton
          <div className="skel h-full w-full rounded-full" />
        ) : dbAvatar ? (
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
          // Fallback: avatar dari Abstract (jika tidak ada di DB)
          <AbstractProfile
            address={address as `0x${string}`}
            size="lg"
            showTooltip={false}
            className="!h-24 !w-24 max-sm:!h-20 max-sm:!w-20 !rounded-full object-cover"
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

      <div className="flex-1 min-w-0 max-sm:w-full max-sm:text-center md:text-left">
        <h1 className="truncate text-2xl max-sm:text-xl font-bold text-neutral-50">
          {displayName}
        </h1>
        <button
          onClick={copyAddress}
          className="group mt-1 flex items-center gap-2 text-sm max-sm:text-xs text-neutral-400 transition-colors hover:text-neutral-300 max-sm:mx-auto md:mx-0"
        >
          <span className="font-mono">{shortAddr(address)}</span>
          {copied ? (
            <>
              <svg className="h-4 w-4 max-sm:h-3 max-sm:w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs max-sm:text-[10px] font-medium text-green-400">Copied!</span>
            </>
          ) : (
            <svg className="h-4 w-4 max-sm:h-3 max-sm:w-3 text-neutral-500 group-hover:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
