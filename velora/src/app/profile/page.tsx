// src/app/profile/page.tsx
import ProfileHeader from "@/components/profile/header";
import ProfileStatsCard from "@/components/profile/stats";
import ProfileActivity from "@/components/profile/activity";
import type { ProfileUser, HistoryItem } from "@/components/profile/types";

export const metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  // Dummy data — sambungkan ke auth/database sesuai kebutuhan
  const user: ProfileUser = {
    name: "Velora User",
    wallet: "0x8aae...9A2E",
    avatar: "https://lh3.googleusercontent.com/a-/AOh14Gh2wGwxyz=s96-c",
    bio: "Content creator and photography enthusiast. Sharing my journey and skills with the world.",
    stats: {
      followers: 1200,
      following: 180,
      points: 2500,
      // eth: 0.002, // sudah tidak dipakai
    },
    interests: ["Cooking", "Photography", "Business", "Music"],
    activity: [
      { id: 1, type: "video", title: "How to shoot portraits with natural light", time: "2h ago" },
      { id: 2, type: "post", title: "Behind the scene of my last workshop", time: "1d ago" },
      { id: 3, type: "badge", title: "Completed: Lighting Basics", time: "3d ago" },
    ],
  };

  const history: HistoryItem[] = [
    { id: "h1", kind: "order",   title: "Bought: Cooking Masterclass", amount: "$10",    time: "Mar 12" },
    { id: "h2", kind: "watched", title: "Watched: Portrait Lighting 101", meta: "12 min", time: "Mar 10" },
    { id: "h3", kind: "quiz",    title: "Quiz Completed: Camera Basics", meta: "Score 90%", time: "Mar 9" },
    { id: "h4", kind: "reward",  title: "Daily Streak Reward",           meta: "+50 pts",   time: "Mar 9" },
  ];

  // Data rank (overall). Nanti sambungkan ke leaderboard/DB.
  const overallRank = { rank: 842, total: 15340 };

  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader user={user} />

        {/* Stats + Rank (rank menggantikan ETH) */}
        <div className="mt-6">
          <ProfileStatsCard stats={user.stats} rank={overallRank} />
        </div>

        {/* Riwayat/aktivitas (kamu sudah punya komponen History/Activity) */}
        <div className="mt-10 gap-6">
          <aside className="col-span-12 lg:col-span-6">
            <ProfileActivity items={history} />
          </aside>
        </div>
      </main>
    </div>
  );
}
