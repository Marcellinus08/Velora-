// src/components/profile/types.ts
export type ProfileStats = {
  followers: number;
  following: number;
  points: number;
  eth: number;
};

export type ActivityItem = {
  id: number | string;
  type: "video" | "post" | "badge";
  title: string;
  time: string;
};

export type HistoryItem = {
  id: number | string;
  kind: "order" | "watched" | "quiz" | "reward";
  title: string;
  time: string;
  meta?: string;     // durasi, skor, dll
  amount?: string;   // untuk order/purchase
};

export type ProfileUser = {
  name: string;
  wallet: string;
  avatar: string;
  bio: string;
  stats: ProfileStats;
  interests: string[];
  activity?: ActivityItem[];
};
