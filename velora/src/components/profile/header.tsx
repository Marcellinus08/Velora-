// src/components/profile/header.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import type { ProfileUser } from "./types";

type DbProfile = {
  abstract_id: string;
  username: string | null;
  avatar_url: string | null;
};

function shortAddr(addr?: string | null) {
  if (!addr) return "-";
  const a = addr.trim();
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  const { address } = useAccount();
  const addrLower = useMemo(
    () => (address ? address.toLowerCase() : ""),
    [address]
  );

  // fallback dari dummy (tetap dipakai kalau belum connect atau DB kosong)
  const baseName = user?.name || shortAddr(address);
  const baseAvatar = user?.avatar || "";
  const baseBio = user?.bio || "";

  const [displayName, setDisplayName] = useState<string>(baseName);
  const [avatarSrc, setAvatarSrc] = useState<string>(baseAvatar);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!addrLower || !/^0x[a-f0-9]{40}$/.test(addrLower)) {
        setDisplayName(baseName);
        setAvatarSrc(baseAvatar);
        return;
      }
      try {
        const r = await fetch(`/api/profiles/${addrLower}`, { cache: "no-store" });
        if (!r.ok) {
          setDisplayName(baseName);
          setAvatarSrc(baseAvatar);
          return;
        }
        const p: DbProfile = await r.json();
        if (!alive) return;

        const name = p.username?.trim() || baseName || shortAddr(addrLower);
        setDisplayName(name);

        if (p.avatar_url) {
          setAvatarSrc(`${p.avatar_url}?v=${Date.now()}`); // cache-busting
        } else {
          setAvatarSrc(baseAvatar);
        }
      } catch {
        if (!alive) return;
        setDisplayName(baseName);
        setAvatarSrc(baseAvatar);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrLower]);

  const finalAvatar =
    avatarSrc ||
    ("data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
          <rect width='100%' height='100%' fill='#161616'/>
          <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
                fill='#777' font-family='sans-serif' font-size='14'>Avatar</text>
        </svg>`
      ));

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
        <Image
          src={finalAvatar}
          alt={`${displayName} avatar`}
          fill
          sizes="96px"
          className="object-cover"
          priority
        />
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
