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
  title: string;
  banner_url: string | null;
  status: "active" | "paused" | "ended";
  clicks: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  created_at: string;
  cta_text: string | null;
  description: string | null;
};
