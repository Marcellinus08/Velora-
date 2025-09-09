"use client";

import React from "react";
import Sidebar from "@/components/sidebar";
import Leaderboard, { TopUser, TableEntry } from "@/components/leaderboard";

/* ===== Placeholder Avatar ===== */
function AccountIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`text-neutral-200 ${className}`} fill="currentColor">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 8a8 8 0 1116 0v1H4v-1z" />
    </svg>
  );
}
const AvatarPlaceholder = () => <AccountIcon className="h-3/5 w-3/5" />;

/* ===== Types untuk detail user (modal) ===== */
type UserProfile = {
  name: string;
  handle: string;
  rank?: number;
  score?: number;
  purchases: { title: string; date: string; price: string }[];
  activity: { time: string; text: string }[];
};

/* ====== Data dummy detail user ====== */
const PROFILE_DB: Record<string, UserProfile> = {
  cristianoronaldo: {
    name: "Cristiano Ronaldo",
    handle: "cristianoronaldo",
    rank: 1,
    score: 15000,
    purchases: [
      { title: "Finishing Masterclass", date: "2024-02-11", price: "$19" },
      { title: "Mindset for Champions", date: "2024-03-02", price: "$12" },
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
      { title: "Playmaker Vision", date: "2024-01-20", price: "$15" },
      { title: "Free-kick Secrets", date: "2024-01-25", price: "$10" },
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
    purchases: [{ title: "Creative Skills Pack", date: "2024-02-05", price: "$29" }],
    activity: [{ time: "2024-03-01 14:12", text: "Shared a highlight to community." }],
  },
  michaeljordan: {
    name: "Michael Jordan",
    handle: "michaeljordan",
    rank: 4,
    score: 9800,
    purchases: [{ title: "Beyond Air: Training", date: "2024-02-16", price: "$18" }],
    activity: [{ time: "2024-03-07 10:01", text: "Completed challenge 'Vertical Jump'." }],
  },
  // tambahkan untuk handle lain jika perlu
};

export default function LeaderboardPage() {
  const podiumAvatar = <AvatarPlaceholder />;
  const rowAvatar = <AvatarPlaceholder />;

  // Top 3
  const top3: [TopUser, TopUser, TopUser] = [
    { rank: 2, name: "Lionel Messi", handle: "leomessi", score: 12_500, avatarNode: podiumAvatar },
    { rank: 1, name: "Cristiano Ronaldo", handle: "cristianoronaldo", score: 15_000, avatarNode: podiumAvatar },
    { rank: 3, name: "Neymar Jr", handle: "neymarjr", score: 10_000, avatarNode: podiumAvatar },
  ];

  // Table entries (dummy)
  const entries: TableEntry[] = [
    { rank: 4, name: "Michael Jordan", handle: "michaeljordan", score: 9_800, avatarNode: rowAvatar },
    { rank: 5, name: "Kylian Mbappé", handle: "kylianmbappe", score: 9_500, avatarNode: rowAvatar },
    { rank: 6, name: "Harry Kane", handle: "harrykane", score: 9_200, avatarNode: rowAvatar },
    { rank: 7, name: "Karim Benzema", handle: "karimbenzema", score: 8_900, avatarNode: rowAvatar },
    { rank: 8, name: "Pele", handle: "pele", score: 8_600, avatarNode: rowAvatar },
    { rank: 9, name: "Erling Haaland", handle: "erlinghaaland", score: 8_450, avatarNode: rowAvatar },
    { rank: 10, name: "Robert Lewandowski", handle: "lewandowski", score: 8_300, avatarNode: rowAvatar },
  ];

  // Current user (contoh)
  const currentUser = {
    rank: 234,
    name: "You",
    handle: "you",
    score: 3_421,
    avatarNode: rowAvatar,
  };

  // ====== state modal ======
  const [selected, setSelected] = React.useState<UserProfile | null>(null);

  const handleUserClick = (u: { name: string; handle: string; rank?: number; score?: number }) => {
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

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1">
        <Leaderboard
          top3={top3}
          entries={entries}
          currentUser={currentUser}
          defaultRange="week"
          onUserClick={handleUserClick}
        />
      </main>

      {selected && (
        <UserDetailModal profile={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* =========================
   Modal Detail User
========================= */
function UserDetailModal({
  profile,
  onClose,
}: {
  profile: UserProfile;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<"purchases" | "activity">("purchases");
  const fmt = (n?: number) => (n == null ? "-" : Intl.NumberFormat("en-US").format(n));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <div>
            <div className="text-lg font-semibold text-neutral-50">
              {profile.name} <span className="text-neutral-400">@{profile.handle}</span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              Rank <span className="text-neutral-200">#{fmt(profile.rank as number)}</span> • Score{" "}
              <span className="text-neutral-200">{fmt(profile.score)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 px-5 py-2">
          <TabButton active={tab === "purchases"} onClick={() => setTab("purchases")} label="Purchases" />
          <TabButton active={tab === "activity"} onClick={() => setTab("activity")} label="Activity" />
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          {tab === "purchases" ? (
            profile.purchases.length ? (
              <ul className="space-y-3">
                {profile.purchases.map((p, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-semibold text-neutral-50">{p.title}</div>
                      <div className="text-xs text-neutral-400">{p.date}</div>
                    </div>
                    <div className="text-sm font-medium text-neutral-200">{p.price}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-sm text-neutral-400">No purchases.</div>
            )
          ) : profile.activity.length ? (
            <ul className="space-y-3">
              {profile.activity.map((a, idx) => (
                <li key={idx} className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
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

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-[var(--primary-500)] text-white" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}
