// src/components/task/types.ts

export type VideoInfo = {
  title: string;
  views: string;
  heroImage: string;
  description: string;
  creator: {
    name: string;
    followers: string; // di UI dipakai untuk menampilkan wallet pendek
    avatar: string;    // boleh kosong, nanti fallback ke AbstractProfile
    wallet?: string;   // alamat wallet penuh (0x...)
  };
  /** optional: kategori/tag dari DB */
  tags?: string[];
};

export type RecommendedVideo = {
  id: string | number;
  title: string;
  creator: {
    name?: string;
    wallet?: string;
  };
  thumbnail: string;
  points?: number;
  price?: {
    amount: number;
    currency: string;
  };
};

export type Comment = {
  id: number | string;
  name: string;
  time: string;
  avatar: string;
  text: string;
};
