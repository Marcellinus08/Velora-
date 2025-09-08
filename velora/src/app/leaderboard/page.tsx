import React from "react";
import Sidebar from "@/components/sidebar";
import Leaderboard, { TopUser, TableEntry } from "@/components/leaderboard";

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

  const top3: [TopUser, TopUser, TopUser] = [
    { rank: 2, name: "Lionel Messi", handle: "leomessi", score: 12500, avatarNode: podiumAvatar },
    { rank: 1, name: "Cristiano Ronaldo", handle: "cristianoronaldo", score: 15000, avatarNode: podiumAvatar },
    { rank: 3, name: "Neymar Jr", handle: "neymarjr", score: 10000, avatarNode: podiumAvatar },
  ];

  const entries: TableEntry[] = [
    { rank: 4, name: "Michael Jordan", handle: "michaeljordan", score: 9800, avatarNode: rowAvatar },
    { rank: 5, name: "Kylian Mbappé", handle: "kylianmbappe", score: 9500, avatarNode: rowAvatar },
    { rank: 6, name: "Harry Kane", handle: "harrykane", score: 9200, avatarNode: rowAvatar },
    { rank: 7, name: "Karim Benzema", handle: "karimbenzema", score: 8900, avatarNode: rowAvatar },
    { rank: 8, name: "Pele", handle: "pele", score: 8600, avatarNode: rowAvatar },
  ];

  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1">
        <Leaderboard top3={top3} entries={entries} />
      </main>
    </div>
  );
}
