export type Creator = {
  name: string;
  followers: string;
  /** URL avatar dari DB (jika ada) */
  avatar?: string | null;
  /** Alamat wallet pemilik video – buat fallback avatar Abstract */
  wallet?: string | null;
};

export type VideoInfo = {
  title: string;
  views: string;
  heroImage: string;
  description: string;
  creator: Creator;
  /** Tag/chips yang ditampilkan di bawah deskripsi (dari DB) */
  tags?: string[];
};

export type Comment = {
  id: string | number;
  name: string;
  time: string;
  avatar: string;
  text: string;
};

export type RecommendedVideo = {
  id: number;
  title: string;
  creator: string;
  thumbnail: string;
};
