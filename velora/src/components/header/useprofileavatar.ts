"use client";

import { useEffect, useMemo, useState } from "react";

export type DbProfile = {
  abstract_id: string;
  username: string | null;
  avatar_url: string | null;
};

export function useProfileAvatar(address?: `0x${string}`) {
  const addr = useMemo(() => (address ? address.toLowerCase() : ""), [address]);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!addr || !/^0x[a-f0-9]{40}$/.test(addr)) {
        if (alive) {
          setUsername(null);
          setAvatarUrl(null);
          setLoading(false);
        }
        return;
      }

      try {
        // DB first (no-store + cache buster)
        const r = await fetch(`/api/profiles/${addr}?t=${Date.now()}`, { cache: "no-store" });
        let db: DbProfile | null = null;
        if (r.ok) db = (await r.json()) as DbProfile;

        const dbUser = db?.username ?? null;
        const dbAvatar = db?.avatar_url ?? null;
        if (alive) setUsername(dbUser);

        if (dbAvatar) {
          if (alive) setAvatarUrl(`${dbAvatar}?v=${Date.now()}`);
          if (alive) setLoading(false);
          return;
        }

        // Fallback: Abstract profile picture
        try {
          const ra = await fetch(`/api/abstract/user/${addr}`, { cache: "force-cache" });
          if (ra.ok) {
            const j = await ra.json();
            const abs: string | null = j?.profilePicture || j?.avatar || j?.imageUrl || null;
            if (alive) setAvatarUrl(abs ?? null);
          } else if (alive) setAvatarUrl(null);
        } catch {
          if (alive) setAvatarUrl(null);
        }
      } catch {
        if (alive) {
          setUsername(null);
          setAvatarUrl(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [addr]);

  return { username, avatarUrl, loading };
}
