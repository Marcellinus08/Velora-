export type Kind = "voice" | "video";

export type MeetCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  tags?: string[];
  pricing: { voice?: number; video?: number };
};

export type Booking = {
  id: string;
  creator: MeetCreator;
  kind: Kind;
  startAt: string; // ISO
  minutes: number;
  pricePerMinute: number;
  status: "upcoming" | "pending" | "history";
};
