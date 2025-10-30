export type TopUser = {
  name: string;
  handle: string;
  score: number;
  rank: 1 | 2 | 3;
  avatarUrl?: string;
  avatarNode: React.ReactNode;
};

export type TableEntry = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatarUrl?: string;
  avatarNode: React.ReactNode;
};

export type CurrentUser = {
  rank: number;
  name: string;
  handle: string;
  score: number;
  avatarUrl?: string;
  avatarNode: React.ReactNode;
};

export type RangeKey = "today" | "week" | "month" | "all";

/* Profile modal types */

// History Types
export type HistoryType = "video_purchase" | "subscription" | "meet_purchase" | "ad_purchase";

export type VideoPurchaseHistory = {
  type: "video_purchase";
  id: string;
  date: string;
  video: {
    id: string;
    title: string;
    thumbnail?: string;
    creator: string;
    creatorAvatar?: string;
  };
  price: number;
  currency: string;
  status: string;
  txHash?: string;
};

export type SubscriptionHistory = {
  type: "subscription";
  id: string;
  date: string;
  tier: string;
  price: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
};

export type MeetPurchaseHistory = {
  type: "meet_purchase";
  id: string;
  date: string;
  meet: {
    id: string;
    creator: string;
    creatorAvatar?: string;
    creatorAddr: string;
    duration: number;
    scheduledAt?: string;
  };
  price: number;
  currency: string;
  status: string;
};

export type AdPurchaseHistory = {
  type: "ad_purchase";
  id: string;
  date: string;
  adType: string;
  duration: number;
  price: number;
  currency: string;
  status: string;
  impressions?: number;
};

export type HistoryItem = 
  | VideoPurchaseHistory 
  | SubscriptionHistory 
  | MeetPurchaseHistory 
  | AdPurchaseHistory;

export type HistoryStats = {
  totalTransactions: number;
  totalSpent: number;
  videoPurchases: number;
  meetPurchases: number;
  subscriptions: number;
  adPurchases: number;
  adsCreated: number;
};

// Activity Types
export type ActivityType = 
  | "video_upload" 
  | "task_completed" 
  | "video_shared" 
  | "video_purchased"
  | "post_created" 
  | "meet_hosted" 
  | "meet_attended" 
  | "milestone";

export type VideoUploadActivity = {
  type: "video_upload";
  id: string;
  date: string;
  description: string;
  video: {
    id: string;
    title: string;
    thumbnail?: string;
    views: number;
    likes: number;
  };
  points: number;
  icon: string;
};

export type TaskCompletedActivity = {
  type: "task_completed";
  id: string;
  date: string;
  description: string;
  video: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  points: number;
  icon: string;
};

export type SocialActivity = {
  type: "post_created" | "video_shared";
  id: string;
  date: string;
  description: string;
  video?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  post?: {
    id: string;
    content: string;
    likes: number;
    comments: number;
  };
  points: number;
  icon: string;
};

export type MeetActivity = {
  type: "meet_hosted" | "meet_attended";
  id: string;
  date: string;
  description: string;
  meet: {
    id: string;
    duration: number;
    participant?: string;
    participantAvatar?: string;
    creator?: string;
    creatorAvatar?: string;
  };
  earnings?: number;
  points: number;
  icon: string;
};

export type MilestoneActivity = {
  type: "milestone";
  id: string;
  date: string;
  description: string;
  points: number;
  icon: string;
};

export type ActivityItem = 
  | VideoUploadActivity 
  | TaskCompletedActivity 
  | SocialActivity 
  | MeetActivity 
  | MilestoneActivity;

export type ActivityStats = {
  totalActivities: number;
  totalPointsEarned: number;
  totalEarnings: number;
  videosUploaded: number;
  tasksCompleted: number;
  postsCreated: number;
  meetsHosted: number;
  meetsAttended: number;
};

// Legacy types for backward compatibility
export type Purchase = {
  title: string;
  date: string;
  price: string;
  type?: "Purchase" | "Subscription";
};

export type Activity = { time: string; text: string };

export type UserProfile = {
  name: string;
  handle: string;
  rank?: number;
  score?: number;
  avatarUrl?: string;
  purchases: Purchase[];
  activity: Activity[];
};
