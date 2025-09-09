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

/* ====== Profile types ====== */
type Purchase = {
  title: string;
  date: string;
  price: string;
  type?: "Purchase" | "Subscription";
};
type Activity = { time: string; text: string };
type UserProfile = {
  name: string;
  handle: string;
  rank?: number;
  score?: number;
  purchases: Purchase[];
  activity: Activity[];
};

/* ====== Dummy local DB (bisa kamu ganti API) ====== */
const PROFILE_DB: Record<string, UserProfile> = {
  cristianoronaldo: {
    name: "Cristiano Ronaldo",
    handle: "cristianoronaldo",
    rank: 1,
    score: 15000,
    purchases: [
      { title: "Finishing Masterclass", date: "2024-02-11", price: "$19", type: "Purchase" },
      { title: "Mindset for Champions", date: "2024-03-02", price: "$12", type: "Purchase" },
    ],
    activity: [
      { time: "2024-03-12 10:25", text: "Scored 500 points from challenge 'Speed Dribble'." },
      { time: "2024-03-10 17:03", text: "Watched 'Finishing Masterclass' (90%)." },
    ],
  },
  leomessi: {
    name: "Lionel Messi",
    handle: "leomessi",
    rank: 2,
    score: 12500,
    purchases: [
      { title: "Playmaker Vision", date: "2024-01-20", price: "$15", type: "Purchase" },
      { title: "Free-kick Secrets", date: "2024-01-25", price: "$10", type: "Purchase" },
    ],
    activity: [
      { time: "2024-03-09 08:12", text: "Completed test 'First Touch Drill'." },
      { time: "2024-02-28 20:18", text: "Earned 320 points from daily quests." },
    ],
  },
  neymarjr: {
    name: "Neymar Jr",
    handle: "neymarjr",
    rank: 3,
    score: 10000,
    purchases: [{ title: "Creative Skills Pack", date: "2024-02-05", price: "$29", type: "Purchase" }],
    activity: [{ time: "2024-03-01 14:12", text: "Shared a highlight to community." }],
  },
  michaeljordan: {
    name: "Michael Jordan",
    handle: "michaeljordan",
    rank: 4,
    score: 9800,
    purchases: [{ title: "Beyond Air: Training", date: "2024-02-16", price: "$18", type: "Purchase" }],
    activity: [{ time: "2024-03-07 10:01", text: "Completed challenge 'Vertical Jump'." }],
  },
};

/* =========================
   Leaderboard
========================= */
export default function Leaderboard({
  top3,
  entries,
  currentUser,
  defaultRange = "week",
}: {
  top3: [TopUser, TopUser, TopUser];
  entries: TableEntry[];
  currentUser?: CurrentUser;
  defaultRange?: RangeKey;
}) {
  // ensure order
  const first = top3.find((u) => u.rank === 1)!;
  const second = top3.find((u) => u.rank === 2)!;
  const third = top3.find((u) => u.rank === 3)!;

  // UI state
  const [range, setRange] = React.useState<RangeKey>(defaultRange);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Modal state
  const [selected, setSelected] = React.useState<UserProfile | null>(null);

  const openProfile = (u: { name: string; handle: string; rank?: number; score?: number }) => {
    const found = PROFILE_DB[u.handle];
    setSelected(
      found ?? {
        name: u.name,
        handle: u.handle,
        rank: u.rank,
        score: u.score,
        purchases: [],
        activity: [],
      }
    );
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">Leaderboard</h1>
          <RangeFilter value={range} onChange={setRange} />
        </div>

        {/* Top 3 */}
        <div className="mt-10 grid grid-cols-1 place-items-center gap-12 sm:grid-cols-3">
          <PodiumCard user={second} borderClass="border-neutral-700" onOpen={openProfile} />
          <PodiumCard user={first} highlight onOpen={openProfile} />
          <PodiumCard user={third} borderClass="border-neutral-700" onOpen={openProfile} />
        </div>

        {/* Current user card */}
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
      </div>

      {/* Modal disini */}
      {selected && <ProfileModal profile={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* =========================
   Sub Components
========================= */
function RangeFilter({ value, onChange }: { value: RangeKey; onChange: (v: RangeKey) => void }) {
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
              active ? "bg-[var(--primary-500)] text-white" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function PodiumCard({
  user,
  highlight = false,
  borderClass = "border-neutral-700",
  onOpen,
}: {
  user: TopUser;
  highlight?: boolean;
  borderClass?: string;
  onOpen?: (u: { name: string; handle: string; rank?: number; score?: number }) => void;
}) {
  const ringClass = highlight ? "border-yellow-400" : borderClass;
  const badgeClass = highlight ? "border-yellow-400 text-yellow-400" : "border-neutral-700 text-yellow-400";
  const sizeClass = highlight ? "h-44 w-44" : "h-36 w-36";

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score });
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.({ name: user.name, handle: user.handle, rank: user.rank, score: user.score })}
      onKeyDown={handleKey}
      className="relative flex w-full max-w-[14rem] flex-col items-center outline-none sm:max-w-[16rem] focus-visible:ring-2 focus-visible:ring-[var(--primary-500)] rounded-lg"
    >
      {highlight && (
        <svg className="absolute -top-12 h-16 w-16 text-yellow-400" viewBox="0 0 256 256" fill="currentColor">
          <path d="M226.5,72.46l-21-48A16,16,0,0,0,189.65,16H66.35a16,16,0,0,0-15.84,8.46l-21,48A16,16,0,0,0,24,88v24a8,8,0,0,0,8,8h8v96a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V120h8a8,8,0,0,0,8-8V88A16,16,0,0,0,226.5,72.46ZM66.35,32H189.65l13.13,30H53.22ZM200,224H56V120H200Z" />
        </svg>
      )}

      <div className={`absolute -top-6 rounded-full border-4 ${badgeClass} bg-neutral-800 px-4 py-1.5 ${
        highlight ? "text-xl font-bold" : "text-lg font-bold"
      }`}>
        {user.rank}
      </div>

      {/* Avatar */}
      <div className={`mt-8 relative ${sizeClass} flex items-center justify-center overflow-hidden rounded-full border-4 ${ringClass} bg-neutral-700`}>
        {user.avatarNode}
      </div>

      <h3 className={`mt-4 ${highlight ? "text-2xl" : "text-xl"} font-bold text-neutral-50`}>{user.name}</h3>
      <p className="text-neutral-400">@{user.handle}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <svg className={`text-yellow-400 ${highlight ? "h-6 w-6" : "h-5 w-5"}`} viewBox="0 0 256 256" fill="currentColor">
          <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
        </svg>
        <span className={`${highlight ? "text-xl" : "text-lg"} font-bold text-neutral-50`}>
          {Intl.NumberFormat("en-US").format(user.score)}
        </span>
      </div>
    </div>
  );
}

function CurrentUserCard({ user, fmt }: { user: CurrentUser; fmt: (n: number) => string }) {
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

/* =========================
   Profile Modal
========================= */
function ProfileModal({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [tab, setTab] = React.useState<"history" | "activity">("history");
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");

  const spent = React.useMemo(() => {
    const num = (s: string) => Number((s || "").replace(/[^0-9.]/g, "")) || 0;
    return profile.purchases.reduce((acc, p) => acc + num(p.price), 0);
  }, [profile.purchases]);
  const fmtNum = (n?: number) => (n == null ? "-" : Intl.NumberFormat("en-US").format(n));

  React.useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const filtered = React.useMemo(() => {
    const rows = profile.purchases.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    rows.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return rows;
  }, [profile.purchases, q, sort]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* Header */}
        <div className="grid grid-cols-1 gap-6 border-b border-neutral-800 p-6 sm:grid-cols-3">
          <div className="col-span-2">
            <div className="text-lg font-semibold text-neutral-50">
              {profile.name} <span className="text-neutral-400">@{profile.handle}</span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              Rank <span className="text-neutral-50">#{fmtNum(profile.rank)}</span> • Points{" "}
              <span className="text-neutral-50">{fmtNum(profile.score)}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Points" value={`${fmtNum(profile.score)} pts`} />
            <StatCard label="Spent" value={`$${fmtNum(spent)}`} />
            <StatCard label="Rank" value={profile.rank ? `#${fmtNum(profile.rank)}` : "-"} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-6 py-3">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "history"} onClick={() => setTab("history")} label="History" />
            <TabButton active={tab === "activity"} onClick={() => setTab("activity")} label="Activity" />
          </div>
          <button onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800">Close</button>
        </div>

        {/* Filters */}
        {tab === "history" && (
          <div className="flex flex-col gap-3 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-2">
              <svg className="h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm11 2l-6-6" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos" className="w-64 bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-400" />
            </div>
            <label className="text-sm text-neutral-400">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {tab === "history" ? (
            <div className="overflow-hidden rounded-lg border border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Video</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                  {filtered.length ? filtered.map((p, i) => (
                    <tr key={i} className="bg-neutral-900/60">
                      <td className="px-4 py-3 text-sm text-neutral-200">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{p.type ?? "Purchase"}</td>
                      <td className="px-4 py-3 text-sm text-neutral-50">{p.price}</td>
                      <td className="px-4 py-3 text-sm text-neutral-300">{p.date}</td>
                      <td className="px-4 py-3">
                        <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800">View</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">No purchases found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : profile.activity.length ? (
            <ul className="space-y-3">
              {profile.activity.map((a, idx) => (
                <li key={idx} className="rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                  <div className="text-sm text-neutral-50">{a.text}</div>
                  <div className="text-xs text-neutral-400">{a.time}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-neutral-400">No activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm ${
      active ? "bg-[var(--primary-500)] text-white" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
    }`}>
      {label}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2">
      <div>
        <div className="text-xs text-neutral-400">{label}</div>
        <div className="text-sm font-semibold text-neutral-50">{value}</div>
      </div>
    </div>
  );
}
