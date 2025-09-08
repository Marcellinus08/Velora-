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

export default function Leaderboard({
  top3,
  entries,
}: {
  top3: [TopUser, TopUser, TopUser];
  entries: TableEntry[];
}) {
  const first = top3.find((u) => u.rank === 1)!;
  const second = top3.find((u) => u.rank === 2)!;
  const third = top3.find((u) => u.rank === 3)!;

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
          Leaderboard
        </h1>

        {/* Top 3 - grid agar rapi & seragam */}
        <div className="mt-10 grid grid-cols-1 place-items-center gap-12 sm:grid-cols-3">
          <PodiumCard user={second} borderClass="border-neutral-700" />
          <PodiumCard user={first} highlight />
          <PodiumCard user={third} borderClass="border-neutral-700" />
        </div>

        {/* Table */}
        <div className="mt-12 overflow-hidden rounded-lg border border-neutral-800">
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
              {entries.map((e) => (
                <tr key={e.rank} className="bg-neutral-800/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-50 sm:pl-6">
                    {e.rank}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-4">
                      {/* Avatar wrapper 40x40, center */}
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
                        {e.avatarNode}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-50">
                          {e.name}
                        </div>
                        <div className="text-neutral-400">@{e.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-neutral-50">
                    {Intl.NumberFormat("en-US").format(e.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
}: {
  user: TopUser;
  highlight?: boolean;
  borderClass?: string;
}) {
  const ringClass = highlight ? "border-yellow-400" : borderClass;
  const badgeClass = highlight
    ? "border-yellow-400 text-yellow-400"
    : "border-neutral-700 text-yellow-400";
  const sizeClass = highlight ? "h-44 w-44" : "h-36 w-36"; 

  return (
    <div className="relative flex w-full max-w-[14rem] flex-col items-center sm:max-w-[16rem]">
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
