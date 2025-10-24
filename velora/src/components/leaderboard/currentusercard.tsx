"use client";

import MI from "./MI";
import type { CurrentUser } from "./types";

export default function CurrentUserCard({ user, fmt }: { user: CurrentUser; fmt: (n: number) => string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
          {user.avatarNode}
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-50">{user.name}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-neutral-400">
          Rank <span className="ml-1 font-semibold text-neutral-50">#{user.rank}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MI name="star" className="text-[14px] text-yellow-400" />
          <span className="text-sm font-semibold text-neutral-50">{fmt(user.score)}</span>
        </div>
      </div>
    </div>
  );
}
