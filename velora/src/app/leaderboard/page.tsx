// src/app/leaderboard/page.tsx
"use client";

import React from "react";
import Sidebar from "@/components/sidebar";

import RangeFilter from "@/components/leaderboard/rangefilter";
import PodiumCard from "@/components/leaderboard/podiumcard";
import CurrentUserCard from "@/components/leaderboard/currentusercard";
import ProfileModal from "@/components/leaderboard/profilemodal";

import { PROFILE_DB } from "@/components/leaderboard/data";
import type {
  TopUser,
  TableEntry,
  CurrentUser,
  RangeKey,
  UserProfile,
} from "@/components/leaderboard/types";

/* Avatar placeholder contoh */
function AccountIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`text-neutral-200 ${className}`} fill="currentColor">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0v1H4v-1z" />
    </svg>
  );
}
const AvatarPlaceholder = () => <AccountIcon className="h-3/5 w-3/5" />;

export default function LeaderboardPage() {
  const podiumAvatar = <AvatarPlaceholder />;
  const rowAvatar = <AvatarPlaceholder />;

  // Top 3
  const top3: [TopUser, TopUser, TopUser] = [
    { rank: 2, name: "Lionel Messi", handle: "leomessi", score: 12_500, avatarNode: podiumAvatar },
    { rank: 1, name: "Cristiano Ronaldo", handle: "cristianoronaldo", score: 15_000, avatarNode: podiumAvatar },
    { rank: 3, name: "Neymar Jr", handle: "neymarjr", score: 10_000, avatarNode: podiumAvatar },
  ];

  // Table entries
  const entries: TableEntry[] = [
    { rank: 4, name: "Michael Jordan", handle: "michaeljordan", score: 9_800, avatarNode: rowAvatar },
    { rank: 5, name: "Kylian Mbappé", handle: "kylianmbappe", score: 9_500, avatarNode: rowAvatar },
    { rank: 6, name: "Harry Kane", handle: "harrykane", score: 9_200, avatarNode: rowAvatar },
    { rank: 7, name: "Karim Benzema", handle: "karimbenzema", score: 8_900, avatarNode: rowAvatar },
    { rank: 8, name: "Pele", handle: "pele", score: 8_600, avatarNode: rowAvatar },
    { rank: 9, name: "Erling Haaland", handle: "erlinghaaland", score: 8_450, avatarNode: rowAvatar },
    { rank: 10, name: "Robert Lewandowski", handle: "lewandowski", score: 8_300, avatarNode: rowAvatar },
  ];

  // Current user contoh
  const currentUser: CurrentUser = { rank: 234, name: "You", handle: "you", score: 3_421, avatarNode: rowAvatar };

  // ====== Orchestration state (di page) ======
  const [range, setRange] = React.useState<RangeKey>("week");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selected, setSelected] = React.useState<UserProfile | null>(null);

  React.useEffect(() => setPage(1), [range, pageSize]);

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);
  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  function openProfile(u: { name: string; handle: string; rank?: number; score?: number }) {
    const found = PROFILE_DB[u.handle];
    setSelected(
      found ?? {
        name: u.name,
        handle: u.handle,
        rank: u.rank,
        score: u.score,
        purchases: [],
        activity: [],
      },
    );
  }

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* === Konsisten dengan Community: container & header === */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Leaderboard</h2>
            <RangeFilter value={range} onChange={setRange} />
          </div>

          {/* Top 3 */}
          <div className="grid grid-cols-1 place-items-center gap-12 sm:grid-cols-3">
            <PodiumCard user={top3.find((u) => u.rank === 2)!} borderClass="border-neutral-700" onOpen={openProfile} />
            <PodiumCard user={top3.find((u) => u.rank === 1)!} highlight onOpen={openProfile} />
            <PodiumCard user={top3.find((u) => u.rank === 3)!} borderClass="border-neutral-700" onOpen={openProfile} />
          </div>

          {/* Current user */}
          {currentUser && <CurrentUserCard user={currentUser} fmt={fmt} />}

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-neutral-800">
            <table className="min-w-full divide-y divide-neutral-800">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-50 sm:pl-6">Rank</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">User</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                {pageEntries.map((e) => (
                  <tr key={e.rank} className="bg-neutral-800/50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-50 sm:pl-6">
                      {e.rank}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-4 text-sm text-neutral-400 cursor-pointer"
                      onClick={() => openProfile({ name: e.name, handle: e.handle, rank: e.rank, score: e.score })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
                          {e.avatarNode}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-50">{e.name}</div>
                          <div className="text-neutral-400">@{e.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-neutral-50">
                      {fmt(e.score)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 bg-neutral-900 px-4 py-3 sm:flex-row">
              <div className="text-sm text-neutral-400">
                Showing <span className="text-neutral-50">{start + 1}</span>–
                <span className="text-neutral-50">{Math.min(start + pageSize, entries.length)}</span> of{" "}
                <span className="text-neutral-50">{fmt(entries.length)}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-400">
                  Rows per page{" "}
                  <select
                    className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800 disabled:opacity-40"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-sm text-neutral-400">
                    Page <span className="text-neutral-50">{page}</span> of{" "}
                    <span className="text-neutral-50">{totalPages}</span>
                  </span>
                  <button
                    className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800 disabled:opacity-40"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          {selected && <ProfileModal profile={selected} onClose={() => setSelected(null)} />}
        </div>
      </main>
    </div>
  );
}
