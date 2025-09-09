export type CommunityPost = {
  authorName: string;
  authorAvatar: string;
  category: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  likes: number;
  replies: number;
  liked?: boolean;
};

export type NewPostPayload = {
  title: string;
  category: string;
  content: string;
};
