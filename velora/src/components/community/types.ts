export type CommunityPost = {
  id: string;
  authorAddress: string;           // lowercase 0x...
  authorName?: string | null;
  authorAvatar?: string | null;    // hanya dari DB; fallback dikerjakan di client
  category: string;
  timeAgo: string;
  title: string;
  content: string;
  excerpt: string;
  likes: number;
  replies: number;
  liked?: boolean;
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
};
