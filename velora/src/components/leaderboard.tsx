"use client";

import Image from "next/image";

/* =========================
   Types
========================= */
export type TopUser = {
  name: string;
  handle: string;
  score: number;
  rank: 1 | 2 | 3;
  avatar: string;
};

export type TableEntry = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatar: string;
};

export default function Leaderboard({
  top3,
  entries,
}: {
  top3: [TopUser, TopUser, TopUser];
  entries: TableEntry[];
}) {
  // ensure correct ordering (rank 1 in the center)
  const first = top3.find((u) => u.rank === 1)!;
  const second = top3.find((u) => u.rank === 2)!;
  const third = top3.find((u) => u.rank === 3)!;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
          Leaderboard
        </h1>

        {/* Top 3 section */}
        <div className="mt-12 flex flex-col items-end gap-12 sm:flex-row sm:items-start sm:justify-center">
          <PodiumCard user={second} borderClass="border-neutral-700" />
          <PodiumCard
            user={first}
            highlight
            wrapperClass="order-first sm:order-none"
          />
          <PodiumCard user={third} borderClass="border-neutral-700" />
        </div>

        {/* Table */}
        <div className="mt-16 flow-root">
          <div className="-my-2 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden rounded-lg border border-neutral-800">
                <table className="min-w-full divide-y divide-neutral-800">
                  <thead className="bg-neutral-800">
                    <tr>
                      <th
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-neutral-50 sm:pl-6"
                        scope="col"
                      >
                        Rank
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50"
                        scope="col"
                      >
                        User
                      </th>
                      <th
                        className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-50"
                        scope="col"
                      >
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
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={e.avatar}
                                alt={e.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-neutral-50">
                                {e.name}
                              </div>
                              <div className="text-neutral-400">
                                @{e.handle}
                              </div>
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
        </div>
      </div>
    </main>
  );
}

/* =========================
   Podium Card Component
========================= */
function PodiumCard({
  user,
  highlight = false,
  wrapperClass = "",
  borderClass = "border-neutral-700",
}: {
  user: TopUser;
  highlight?: boolean;
  wrapperClass?: string;
  borderClass?: string;
}) {
  const ringClass = highlight ? "border-yellow-400" : borderClass;
  const badgeClass = highlight
    ? "border-yellow-400 text-yellow-400"
    : "border-neutral-700 text-yellow-400";
  const sizeClass = highlight ? "h-44 w-44" : "h-36 w-36";
  const wrapperWidth = highlight ? "w-56" : "w-48";

  return (
    <div
      className={`relative flex ${wrapperWidth} flex-col items-center ${wrapperClass}`}
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
        className={`mt-8 relative ${sizeClass} overflow-hidden rounded-full border-4 ${ringClass}`}
      >
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          className="object-cover"
          sizes="176px"
        />
      </div>

      <h3
        className={`mt-4 ${
          highlight ? "text-2xl" : "text-xl"
        } font-bold text-neutral-50`}
      >
        {user.name}
      </h3>
      <p className="text-neutral-400">@{user.handle}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <svg
          className={`h-5 w-5 ${highlight ? "h-6 w-6" : ""} text-yellow-400`}
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
        </svg>
        <span
          className={`${
            highlight ? "text-xl" : "text-lg"
          } font-bold text-neutral-50`}
        >
          {Intl.NumberFormat("en-US").format(user.score)}
        </span>
      </div>
    </div>
  );
}
