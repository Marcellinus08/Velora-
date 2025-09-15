// src/components/settings/account.tsx
"use client";

import { useRef, useState, useEffect } from "react";

export default function SettingsAccount() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Velora User");
  const [username, setUsername] = useState("velora_user");
  const [bio, setBio] = useState(
    "Content creator and photography enthusiast. Sharing my journey and skills with the world."
  );

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  function onPickAvatar() {
    fileRef.current?.click();
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function onSave() {
    // TODO: sambungkan ke API / DB kamu
    alert("Saved! (demo)");
  }

  function onReset() {
    setAvatarUrl(null);
    setDisplayName("Velora User");
    setUsername("velora_user");
    setBio(
      "Content creator and photography enthusiast. Sharing my journey and skills with the world."
    );
  }

  return (
    <section className=" rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-200">Account</h2>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              avatarUrl ??
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='%23161616'/><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-family='sans-serif' font-size='14'>Avatar</text></svg>"
            }
            alt="Avatar preview"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <button
            onClick={onPickAvatar}
            className="rounded-lg bg-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700"
          >
            Change Avatar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
          <p className="mt-2 text-xs text-neutral-500">PNG/JPG up to a few MB.</p>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>

        {/* Username */}
        <div>
          <label className="mb-1 block text-sm text-neutral-300">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
            placeholder="username"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Used in your profile URL and mentions.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={onSave}
          className="rounded-xl bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
        >
          Save Changes
        </button>
        <button
          onClick={onReset}
          className="rounded-xl bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-700"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
