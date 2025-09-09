"use client";
import React from "react";

/* =========================
   Types
========================= */
export type TopUser = {
  name: string;
  handle: string;
  score: number;
  rank: 1 | 2 | 3;
  avatarNode: React.ReactNode;
};

export type TableEntry = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatarNode: React.ReactNode;
};

export type CurrentUser = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatarNode: React.ReactNode;
};

type RangeKey = "today" | "week" | "month" | "all";

/* =========================
   Leaderboard
========================= */
export default function Leaderboard({
  top3,
  entries,
  currentUser,
  defaultRange = "week",
  onUserClick,
}: {
  top3: [TopUser, TopUser, TopUser];
  entries: TableEntry[];
  currentUser?: CurrentUser;
  defaultRange?: RangeKey;
  onUserClick?: (u: { name: string; handle: string; rank?: number; score?: number }) => void;
}) {
  // ensure order
  const first = top3.find((u) => u.rank === 1)!;
  const second = top3.find((u) => u.rank === 2)!;
  const third = top3.find((u) => u.rank === 3)!;

  // UI state
  const [range, setRange] = React.useState<RangeKey>(defaultRange);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Recompute pagination when deps change
  React.useEffect(() => setPage(1), [range, pageSize]);

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageEntries = entries.slice(start, start + pageSize);

  const fmt = (n: number) => Intl.NumberFormat("en-US").format(n);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header + filter */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
            Leaderboard
          </h1>

          <RangeFilter value={range} onChange={setRange} />
        </div>

        {/* Top 3 - grid */}
        <div className="mt-10 grid grid-cols-1 place-items-center gap-12 sm:grid-cols-3">
          <PodiumCard user={second} borderClass="border-neutral-700" onClick={onUserClick} />
          <PodiumCard user={first} highlight onClick={onUserClick} />
          <PodiumCard user={third} borderClass="border-neutral-700" onClick={onUserClick} />
        </div>

        {/* Current user card (optional) */}
        {currentUser && (
          <div className="mt-10">
            <CurrentUserCard user={currentUser} fmt={fmt} />
          </div>
        )}

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-lg border border-neutral-800">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-800">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-50 sm:pl-6">
                  Rank
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">
                  User
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50">
                  Score
                </th>
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
                    onClick={() => onUserClick?.({ name: e.name, handle: e.handle, rank: e.rank, score: e.score })}
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
              <span className="text-neutral-50">
                {Math.min(start + pageSize, entries.length)}
              </span>{" "}
              of <span className="text-neutral-50">{fmt(entries.length)}</span>
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
      </div>
    </div>
  );
}

/* =========================
   Range Filter
========================= */
function RangeFilter({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  const items: { key: RangeKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "all", label: "All-time" },
  ];
  return (
    <div className="inline-flex rounded-full border border-neutral-700 bg-neutral-900 p-1">
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-[var(--primary-500)] text-white"
                : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================
   Podium Card
========================= */
function PodiumCard({
  user,
  highlight = false,
  borderClass = "border-neutral-700",
  onClick,
}: {
  user: TopUser;
  highlight?: boolean;
  borderClass?: string;
  onClick?: (u: { name: string; handle: string; rank?: number; score?: number }) => void;
}) {
  const ringClass = highlight ? "border-yellow-400" : borderClass;
  const badgeClass = highlight
    ? "border-yellow-400 text-yellow-400"
    : "border-neutral-700 text-yellow-400";
  const sizeClass = highlight ? "h-44 w-44" : "h-36 w-36";

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score });
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score })}
      onKeyDown={handleKey}
      className="relative flex w-full max-w-[14rem] flex-col items-center outline-none sm:max-w-[16rem] focus-visible:ring-2 focus-visible:ring-[var(--primary-500)] rounded-lg"
    >
      {highlight && (
        <svg
          className="absolute -top-12 h-16 w-16 text-yellow-400"
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M226.5,72.46l-21-48A16,16,0,0,0,189.65,16H66.35a16,16,0,0,0-15.84,8.46l-21,48A16,16,0,0,0,24,88v24a8,8,0,0,0,8,8h8v96a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V120h8a8,8,0,0,0,8-8V88A16,16,0,0,0,226.5,72.46ZM66.35,32H189.65l13.13,30H53.22ZM200,224H56V120H200Z" />
        </svg>
      )}

      {/* Rank badge */}
      <div
        className={`absolute -top-6 rounded-full border-4 ${badgeClass} bg-neutral-800 px-4 py-1.5 ${
          highlight ? "text-xl font-bold" : "text-lg font-bold"
        }`}
      >
        {user.rank}
      </div>

      {/* Avatar */}
      <div
        className={`mt-8 relative ${sizeClass} flex items-center justify-center overflow-hidden rounded-full border-4 ${ringClass} bg-neutral-700`}
      >
        {user.avatarNode}
      </div>

      <h3 className={`mt-4 ${highlight ? "text-2xl" : "text-xl"} font-bold text-neutral-50`}>
        {user.name}
      </h3>
      <p className="text-neutral-400">@{user.handle}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <svg
          className={`text-yellow-400 ${highlight ? "h-6 w-6" : "h-5 w-5"}`}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
        </svg>
        <span className={`${highlight ? "text-xl" : "text-lg"} font-bold text-neutral-50`}>
          {Intl.NumberFormat("en-US").format(user.score)}
        </span>
      </div>
    </div>
  );
}

/* =========================
   Current User Card
========================= */
function CurrentUserCard({
  user,
  fmt,
}: {
  user: CurrentUser;
  fmt: (n: number) => string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
          {user.avatarNode}
        </div>
        <div>
          <div className="text-sm font-semibold text-neutral-50">{user.name}</div>
          <div className="text-xs text-neutral-400">@{user.handle}</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-neutral-400">
          Rank <span className="ml-1 font-semibold text-neutral-50">#{user.rank}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 256 256" fill="currentColor">
            <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
          </svg>
          <span className="text-sm font-semibold text-neutral-50">{fmt(user.score)}</span>
        </div>
      </div>
    </div>
  );
}
