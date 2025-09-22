// src/components/community/types.ts
export type MediaItem = {
  url: string;
  path: string;
  mime: string | null;
  width: number | null;
  height: number | null;
  duration_s: number | null;
};

export type CommunityPost = {
  id: string;
  authorAddress: string;           // lowercase 0x...
  authorName?: string | null;
  authorAvatar?: string | null;    // hanya dari DB; fallback di client
  category: string;
  timeAgo: string;
  title: string;
  content: string;
  excerpt: string;
  likes: number;
  replies: number;
  liked?: boolean;
  media?: MediaItem[];             // daftar file
};

export type CommunityReply = {
  id: string;
  postId: string;
  authorAddress: string;
  authorName?: string | null;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  parentId?: string | null;
};

export type NewPostPayload = {
  title: string;
  category: string;
  content: string;
  mediaPaths?: string[];           // path dari endpoint upload
};
