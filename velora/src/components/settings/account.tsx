// src/components/settings/account.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { AbstractProfile } from "@/components/abstract-profile";
import { SettingsAccountSkeleton } from "@/components/skeletons/settings-skeleton";

type DbProfile = {
  abstract_id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
};

// SVG placeholder jika tidak ada apa-apa
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

export default function SettingsAccount() {
  const { address } = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);

  // --- State umum ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // --- Data dari DB ---
  const [db, setDb] = useState<DbProfile | null>(null);
  const originalUsernameRef = useRef<string>("");
  const originalAvatarUrlRef = useRef<string | null>(null);

  // --- Data yang muncul di UI ---
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // bisa DB url atau preview blob

  // --- Upload avatar ditunda sampai Save ---
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  // ---- Username availability ----
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);

  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "-";
  const isPreviewActive = !!pendingAvatar && !!pendingPreviewUrl;

  // Cleanup preview blob
  useEffect(() => {
    return () => {
      if (pendingPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  // ---- Load profil dari DB ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const r = await fetch(`/api/profiles/${address}`, { cache: "no-store" });
        const p = (await r.json()) as DbProfile | { error?: string };
        if (!mounted) return;

        if ("error" in p) {
          setDb(null);
          originalUsernameRef.current = "";
          originalAvatarUrlRef.current = null;
          if (!isPreviewActive) {
            setUsername("");
            setAvatarUrl(null);
          }
        } else {
          setDb(p);
          originalUsernameRef.current = p.username ?? "";
          originalAvatarUrlRef.current = p.avatar_url ?? null;

          if (!isPreviewActive) {
            setUsername(p.username ?? "");
            // cache-busting agar tidak ketahan cache lama
            setAvatarUrl(p.avatar_url ? `${p.avatar_url}?v=${Date.now()}` : null);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // ---- Cek ketersediaan username (debounce) ----
  useEffect(() => {
    if (!address) return;

    const u = username.trim().toLowerCase();
    if (!u) {
      setAvailable(null);
      setFormatError(null);
      return;
    }

    // Validasi format sederhana
    if (!/^[a-z0-9_]{3,30}$/.test(u)) {
      setFormatError("Only letters, numbers and '_' are allowed (min 3 characters).");
      setAvailable(false);
      return;
    }

    setFormatError(null);
    setChecking(true);
    setAvailable(null);

    const t = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({
          u,
          exclude: address.toLowerCase(),
        });
        const r = await fetch(`/api/profiles/username/check?${qs.toString()}`, {
          cache: "no-store",
        });
        const j = await r.json();
        setAvailable(j.available === true);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [username, address]);

  function onPickAvatar() {
    fileRef.current?.click();
  }

  // Pilih file avatar → simpan ke state (belum upload)
  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setHint(null);
    setPendingAvatar(f);

    if (pendingPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    const url = URL.createObjectURL(f);
    setPendingPreviewUrl(url);
    setAvatarUrl(url); // tampilkan preview
    e.currentTarget.value = "";
  }

  // Simpan username &/ avatar
  async function onSaveAll() {
    if (!address) {
      setHint("Please connect your wallet first.");
      return;
    }

    const wantUpdateUsername = username.trim() !== originalUsernameRef.current;
    const wantUpdateAvatar = !!pendingAvatar;

    if (!wantUpdateUsername && !wantUpdateAvatar) {
      setHint("Nothing to save.");
      return;
    }

    if (wantUpdateUsername) {
      if (!username.trim()) {
        setHint("Username cannot be empty.");
        return;
      }
      if (formatError || available === false) {
        setHint("Username is not available.");
        return;
      }
    }

    try {
      setSaving(true);
      setHint(null);

      // 1) Upload avatar jika ada pending file
      if (wantUpdateAvatar && pendingAvatar) {
        const form = new FormData();
        form.append("address", address);
        form.append("avatar", pendingAvatar);

        const r = await fetch("/api/profiles/avatar", { method: "POST", body: form });
        const j = await r.json().catch(() => null);

        if (!r.ok || !j?.avatar_url) {
          throw new Error(j?.error || "Upload avatar failed.");
        }

        const displayUrl = j.display_url || `${j.avatar_url}?v=${Date.now()}`;
        setAvatarUrl(displayUrl);
        originalAvatarUrlRef.current = j.avatar_url;

        // bersihkan pending
        setPendingAvatar(null);
        if (pendingPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
      }

      // 2) Upsert username jika berubah
      if (wantUpdateUsername) {
        const u = username.trim();
        const res = await fetch("/api/profiles/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ abstractId: address, username: u }),
        });

        if (res.status === 409) throw new Error("Username already taken.");
        if (!res.ok) throw new Error("Failed to save username.");

        originalUsernameRef.current = u;
        setDb((prev) => (prev ? { ...prev, username: u } : prev));
      }

      setHint("Saved! ✅");
    } catch (e: any) {
      console.error(e);
      setHint(e?.message || "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = (username.trim() !== originalUsernameRef.current) || !!pendingAvatar;
  const canSave =
    !!address &&
    !saving &&
    hasChanges &&
    ((username.trim() === originalUsernameRef.current) ||
      (!!username.trim() && !formatError && available === true));

  if (loading) {
    return <SettingsAccountSkeleton />;
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-200">Account</h2>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
          {avatarUrl ? (
            // DB avatar atau preview
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG;
              }}
            />
          ) : address ? (
            // Fallback: avatar dari Abstract (sama seperti header)
            <AbstractProfile
              size="lg"
              showTooltip={false}
              className="!h-20 !w-20 !rounded-full object-cover"
            />
          ) : (
            // Terakhir: placeholder
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PLACEHOLDER_SVG} alt="Avatar placeholder" className="h-full w-full object-cover" />
          )}
        </div>

        <div>
          <button
            onClick={onPickAvatar}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700 cursor-pointer"
            disabled={!address || saving}
          >
            Choose Avatar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
          <p className="mt-2 text-xs text-neutral-500">
            PNG/JPG up to 5 MB. The image will be uploaded after you click <b>Save</b>.
          </p>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <label className="mb-1 block text-sm text-neutral-300">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
          placeholder={shortAddr}
          disabled={!address || saving}
        />
        {formatError && <p className="text-xs text-red-400">{formatError}</p>}
        {!formatError && (
          <p className="text-xs">
            {checking && <span className="text-neutral-400">Checking availability…</span>}
            {available === true && <span className="text-emerald-400">Username is available ✓</span>}
            {available === false && <span className="text-red-400">Username is taken ✕</span>}
            {available === null && !checking && (
              <span className="text-neutral-500">Enter a username to check availability</span>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={onSaveAll}
          disabled={!canSave}
          className="rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700 cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {hint && <span className="text-sm text-neutral-300">{hint}</span>}
      </div>
    </section>
  );
}
