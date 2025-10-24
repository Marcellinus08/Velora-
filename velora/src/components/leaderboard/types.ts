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
