// src/components/profile/header.tsx
"use client";

import Image from "next/image";
import type { ProfileUser } from "./types";

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-[var(--primary-500)]">
        <Image src={user.avatar} alt={`${user.name} avatar`} fill sizes="96px" className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="truncate text-2xl font-bold text-neutral-50">{user.name}</h1>
        <p className="text-sm text-neutral-400">{user.wallet}</p>
        <p className="mt-2 text-neutral-200">{user.bio}</p>
      </div>
    </div>
  );
}
