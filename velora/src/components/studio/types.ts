export type StudioVideo = {
  id: string;
  title: string;
  thumb: string;
  duration: string;      // "12:34"
  views: number;         // raw number
  date: string;          // "2d ago"
  description?: string;  // optional

  // baru
  buyers?: number;       // total pembeli video
  revenueUsd?: number;   // total pendapatan USD
  points?: number;       // poin yang ditampilkan di badge thumbnail
};

export type StudioAd = {
  id: string;
  name: string;
  status: "Active" | "Paused" | "Ended";
  budget: string;        // "$150"
  spend: string;         // "$64"
  ctr: number;           // 3.4
  date: string;          // "Running" | "Paused yesterday" | etc
};
