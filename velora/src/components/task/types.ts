// src/components/task/types.ts
export type DBProfile = {
  username: string | null;
  avatar_url: string | null;
};

export type DBVideo = {
  id: string;
  title: string;
  description: string | null;
  thumb_url: string | null;
  video_url: string | null;
  abstract_id: string | null;
  price_cents?: number | null;
  currency?: string | null;
  creator?: DBProfile | null; // join: profiles!videos_abstract_id_fkey(...)
};

export type PurchaseRow = {
  id: string;
  created_at: string;
  buyer_id: string;   // EOA 0x...
  video_id: string;   // uuid
  tx_hash?: string | null;
  price_cents?: number | null;
  currency?: string | null;
  tasks_done?: boolean | null;
  status?: string | null; // purchase_status
};

export type RecommendedVideo = {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
};

export type Comment = {
  id: string | number;
  name: string;
  time: string;
  avatar: string;
  text: string;
};
